;;; sidebar-tools.el --- Sidebar helpers -*- lexical-binding: t; -*-

(require 'cl-lib)
(require 'seq)
(require 'subr-x)

;;; --- Shared helpers --------------------------------------------------------

(defun my/minimap--buffer-name ()
  "Return the minimap buffer name."
  (if (boundp 'minimap-buffer-name)
      minimap-buffer-name
    " *MINIMAP*"))

(defun my/minimap--buffer ()
  "Return the current minimap buffer, if any."
  (or (get-buffer (my/minimap--buffer-name))
      (cl-find-if
       (lambda (buf)
         (let ((name (buffer-name buf)))
           (or (string= name " *MINIMAP*")
               (string= name " *Minimap*")
               (string-prefix-p " *MINIMAP" name)
               (string-prefix-p " *Minimap" name))))
       (buffer-list))))

(defun my/treemacs-window ()
  "Return the visible Treemacs window, if any."
  (cond ((and (fboundp 'treemacs-get-local-window)
              (featurep 'treemacs))
         (ignore-errors (treemacs-get-local-window)))
        (t
         (cl-find-if
          (lambda (win)
            (let ((buf (window-buffer win)))
              (and (buffer-live-p buf)
                   (string-prefix-p "*Treemacs" (buffer-name buf)))))
          (window-list (selected-frame) 'nomini)))))

(defun my/imenu-list-buffer ()
  "Return the iMenu List buffer, if any."
  (or (and (boundp 'imenu-list-buffer-name)
           (get-buffer imenu-list-buffer-name))
      (get-buffer " *Ilist*")
      (get-buffer "*Ilist*")))

(defun my/imenu-list-window ()
  "Return the visible *Ilist* window, if any."
  (when-let ((buf (my/imenu-list-buffer)))
    (get-buffer-window buf t)))

(defun my/sidebar-buffer-p (&optional buffer)
  "Return non-nil when BUFFER is one of our sidebar buffers."
  (let* ((buf  (get-buffer (or buffer (current-buffer))))
         (name (and buf (buffer-name buf))))
    (and buf
         (or (eq buf (my/minimap--buffer))
             (or (equal name "*Ilist*")
             (equal name " *Ilist*"))
             (and name (string-prefix-p "*Treemacs" name))))))

(defun my/sidebar-window-p (&optional window)
  "Return non-nil when WINDOW is a sidebar window."
  (let ((win (or window (selected-window))))
    (and (window-live-p win)
         (or (window-parameter win 'window-side)
             (my/sidebar-buffer-p (window-buffer win))))))

(defun my/sidebar-main-window ()
  "Return the main editing window for the current frame."
  (or (let ((win (selected-window)))
        (unless (my/sidebar-window-p win)
          win))
      (cl-find-if
       (lambda (win)
         (not (my/sidebar-window-p win)))
       (window-list (selected-frame) 'nomini))
      (selected-window)))

(defun my/sidebar-main-buffer ()
  "Return the buffer displayed in the main editing window."
  (when-let ((win (my/sidebar-main-window)))
    (window-buffer win)))

(defvar my/sidebar--suspended-state nil
  "Remember which sidebars were visible before they were auto-hidden.")

(defvar my/sidebar--sync-in-progress nil
  "Guard against recursive sidebar visibility synchronization.")

(defun my/sidebar-file-buffer-p (&optional buffer)
  "Return non-nil when BUFFER is a real file-visiting buffer."
  (let ((buf (get-buffer (or buffer (current-buffer)))))
    (and (buffer-live-p buf)
         (buffer-file-name buf)
         (not (my/sidebar-buffer-p buf)))))

(defun my/sidebar-eligible-buffer ()
  "Return the main file-visiting buffer, or nil when none is visible."
  (let ((buf (my/sidebar-main-buffer)))
    (and (my/sidebar-file-buffer-p buf) buf)))

(defun my/sidebar-current-state ()
  "Return the current sidebar visibility state as a plist."
  (list :treemacs (window-live-p (my/treemacs-window))
        :imenu    (window-live-p (my/imenu-list-window))
        :minimap  (and (bound-and-true-p minimap-mode)
                       (my/minimap--buffer)
                       (get-buffer-window (my/minimap--buffer) t))))

(defun my/sidebar-state-empty-p (state)
  "Return non-nil when STATE has no visible sidebars recorded."
  (not (or (plist-get state :treemacs)
           (plist-get state :imenu)
           (plist-get state :minimap))))

(defun my/sidebar-restore-state (state)
  "Restore visible sidebars from STATE."
  (when (and state (my/sidebar-eligible-buffer))
    (when (plist-get state :treemacs)
      (unless (window-live-p (my/treemacs-window))
        (my/toggle-treemacs)))
    (when (plist-get state :imenu)
      (unless (window-live-p (my/imenu-list-window))
        (my/toggle-imenu-list)))
    (when (plist-get state :minimap)
      (unless (bound-and-true-p minimap-mode)
        (my/toggle-minimap)))))

(defun my/sidebar-call-from-main-window (fn &rest args)
  "Call FN with ARGS from the main editing window."
  (let ((win (my/sidebar-main-window)))
    (if (window-live-p win)
        (with-selected-window win
          (apply fn args))
      (apply fn args))))

(defun my/left-column-target-width ()
  "Return the fixed width to use for the left sidebar column."
  (max (if (boundp 'treemacs-width) treemacs-width 0)
       (if (and (boundp 'imenu-list-size)
                (integerp imenu-list-size))
           imenu-list-size
         30)))

(defun my/left-column--ensure-width (&optional cols)
  "Normalize the left sidebar column width to COLS."
  (let* ((cols (or cols (my/left-column-target-width)))
         (twin (my/treemacs-window))
         (iwin (my/imenu-list-window)))
    (dolist (win (delq nil (list twin iwin)))
      (when (window-live-p win)
        (let ((delta (- cols (window-total-width win))))
          (unless (zerop delta)
            (ignore-errors
              (adjust-window-trailing-edge win delta t))))
        (set-window-parameter win 'window-size-fixed 'width)
        (set-window-parameter win 'no-other-window t)
        (set-window-parameter win 'no-delete-other-windows t)
        (set-window-dedicated-p win t)))))

;;; --- Minimap ---------------------------------------------------------------

(with-eval-after-load 'minimap
  (setq minimap-window-location 'right
        minimap-width-fraction 0.12
        minimap-minimum-width 18
        minimap-dedicated-window t)

  (dolist (mode '(org-mode text-mode conf-mode))
    (cl-pushnew mode minimap-major-modes))

  (defun my/minimap-setup ()
    "Keep the minimap on the right with a fixed width."
    (when-let* ((buf (my/minimap--buffer))
                (win (get-buffer-window buf t)))
      (set-window-parameter win 'window-size-fixed 'width)
      (set-window-parameter win 'no-other-window t)
      (set-window-parameter win 'no-delete-other-windows t)
      (set-window-dedicated-p win t)
      (let* ((target (or minimap-minimum-width 18))
             (delta  (- target (window-total-width win))))
        (unless (zerop delta)
          (ignore-errors
            (adjust-window-trailing-edge win delta t))))))

  (add-hook 'minimap-mode-hook
            (lambda ()
              (when minimap-mode
                (run-at-time 0.05 nil #'my/minimap-setup)))))

;;;###autoload
(defun my/toggle-minimap ()
  "Toggle minimap from the main editing window and keep it on the right."
  (interactive)
  (unless (require 'minimap nil t)
    (user-error "minimap is not available"))
  (unless (or (my/sidebar-eligible-buffer)
              (bound-and-true-p minimap-mode))
    (user-error "Open a file-visiting buffer first"))
  (when (my/sidebar-eligible-buffer)
    (setq my/sidebar--suspended-state nil))
  (let ((minimap-window-location 'right)
        (minimap-width-fraction 0.12))
    (if (bound-and-true-p minimap-mode)
        (minimap-mode -1)
      (my/sidebar-call-from-main-window
       (lambda ()
         (when (boundp 'minimap-major-modes)
           (dolist (mode '(org-mode text-mode conf-mode))
             (cl-pushnew mode minimap-major-modes)))
         (minimap-mode 1)))
      (run-at-time 0.05 nil #'my/minimap-setup))))

;;;###autoload
(defun my/minimap ()
  "Compatibility alias for `my/toggle-minimap'."
  (interactive)
  (my/toggle-minimap))

;;; --- Treemacs --------------------------------------------------------------

(with-eval-after-load 'treemacs
  (setq treemacs-position 'left
        treemacs-is-never-other-window t
        treemacs-width-is-initially-locked t))

(defun my/imenu-list-refresh-layout ()
  "Redisplay *Ilist* using the current left-sidebar layout."
  (interactive)
  (when-let ((buf (my/imenu-list-buffer)))
    (when-let ((win (get-buffer-window buf t)))
      (delete-window win))
    (when (featurep 'imenu-list)
      (my/display-imenu-list buf nil))
    (run-at-time 0.01 nil #'my/left-column--ensure-width)))

;;;###autoload
(defun my/toggle-treemacs ()
  "Toggle Treemacs from the main editing window and refresh iMenu layout."
  (interactive)
  (unless (require 'treemacs nil t)
    (user-error "treemacs is not available"))
  (unless (or (my/sidebar-eligible-buffer)
              (window-live-p (my/treemacs-window)))
    (user-error "Open a file-visiting buffer first"))
  (when (my/sidebar-eligible-buffer)
    (setq my/sidebar--suspended-state nil))
  (my/sidebar-call-from-main-window #'treemacs)
  (run-at-time
   0.05 nil
   (lambda ()
     (my/left-column--ensure-width)
     (when (my/imenu-list-window)
       (my/imenu-list-refresh-layout)))))

;;; --- iMenu List ------------------------------------------------------------

(with-eval-after-load 'imenu-list
  (setq imenu-list-buffer-name " *Ilist*"
        imenu-list-position 'left
        imenu-list-size 30
        imenu-list-focus-after-activation nil
        imenu-list-auto-resize nil)

  (when-let ((buf (get-buffer "*Ilist*")))
    (with-current-buffer buf
      (rename-buffer imenu-list-buffer-name t)))

  (defun my/display-imenu-list (buffer _alist)
    "Display BUFFER as the left iMenu sidebar.
If Treemacs is visible, place iMenu underneath it. Otherwise use the full
left side."
    (let* ((have-tree (window-live-p (my/treemacs-window)))
           (slot      (if have-tree 1 0))
           (win       (display-buffer-in-side-window
                       buffer
                       `((side . left)
                         (slot . ,slot)
                         (window-parameters
                          . ((no-other-window . t)
                             (no-delete-other-windows . t)))))))
      (set-window-parameter win 'window-size-fixed 'width)
      (set-window-parameter win 'no-other-window t)
      (set-window-parameter win 'no-delete-other-windows t)
      (set-window-dedicated-p win t)
      (my/left-column--ensure-width)
      win))

  (setq display-buffer-alist
        (cl-remove-if
         (lambda (entry)
           (and (consp entry)
                (stringp (car entry))
                (string-match-p "\\` ?\\*Ilist\\*\\'" (car entry))))
         display-buffer-alist))

  (add-to-list 'display-buffer-alist
               '("\\` ?\\*Ilist\\*\\'" my/display-imenu-list))

  (defun my/imenu-list-update-from-main-buffer-a (orig-fn &rest args)
    "Run ORIG-FN from the main editing buffer, never from sidebars."
    (if-let ((buf (my/sidebar-eligible-buffer)))
        (with-current-buffer buf
          (apply orig-fn args))
      (apply orig-fn args)))

  (when (advice-member-p #'my/imenu-list-use-main-buffer-a #'imenu-list-collect-entries)
    (advice-remove 'imenu-list-collect-entries #'my/imenu-list-use-main-buffer-a))

  (unless (advice-member-p #'my/imenu-list-update-from-main-buffer-a #'imenu-list-update)
    (advice-add 'imenu-list-update :around #'my/imenu-list-update-from-main-buffer-a)))

;;;###autoload
(defun my/toggle-imenu-list ()
  "Toggle iMenu List from the main editing window and keep its layout stable."
  (interactive)
  (unless (require 'imenu-list nil t)
    (user-error "imenu-list is not available"))
  (unless (or (my/sidebar-eligible-buffer)
              (window-live-p (my/imenu-list-window)))
    (user-error "Open a file-visiting buffer first"))
  (when (my/sidebar-eligible-buffer)
    (setq my/sidebar--suspended-state nil))
  (my/sidebar-call-from-main-window #'imenu-list-smart-toggle)
  (run-at-time
   0.05 nil
   (lambda ()
     (when (my/imenu-list-window)
       (my/imenu-list-refresh-layout)))))

;;; --- Unified toggles -------------------------------------------------------

(defun my/sidebars-visible-p ()
  "Return non-nil if any of the custom sidebars are visible."
  (or (window-live-p (my/treemacs-window))
      (window-live-p (my/imenu-list-window))
      (and (my/minimap--buffer)
           (get-buffer-window (my/minimap--buffer) t))))

(defun my/open-sidebars ()
  "Open Treemacs, iMenu List and Minimap."
  (interactive)
  (unless (window-live-p (my/treemacs-window))
    (my/toggle-treemacs))
  (unless (window-live-p (my/imenu-list-window))
    (my/toggle-imenu-list))
  (unless (bound-and-true-p minimap-mode)
    (my/toggle-minimap)))

(defun my/close-sidebars ()
  "Close Treemacs, iMenu List and Minimap."
  (interactive)
  (when (window-live-p (my/treemacs-window))
    (my/toggle-treemacs))
  (when (window-live-p (my/imenu-list-window))
    (my/toggle-imenu-list))
  (when (bound-and-true-p minimap-mode)
    (minimap-mode -1)))

(defun my/toggle-sidebars ()
  "Toggle Treemacs, iMenu List and Minimap."
  (interactive)
  (unless (my/sidebar-eligible-buffer)
    (user-error "Open a file-visiting buffer first"))
  (setq my/sidebar--suspended-state nil)
  (if (my/sidebars-visible-p)
      (my/close-sidebars)
    (my/open-sidebars)))

(defun my/sidebar-sync-visibility-h (&rest _)
  "Hide sidebars for non-file buffers and restore them for file buffers."
  (unless my/sidebar--sync-in-progress
    (let ((my/sidebar--sync-in-progress t))
      (if (my/sidebar-eligible-buffer)
          (when my/sidebar--suspended-state
            (let ((state my/sidebar--suspended-state))
              (setq my/sidebar--suspended-state nil)
              (run-at-time 0.05 nil
                           (lambda ()
                             (my/sidebar-restore-state state)))))
        (when (my/sidebars-visible-p)
          (let ((state (my/sidebar-current-state)))
            (setq my/sidebar--suspended-state
                  (unless (my/sidebar-state-empty-p state) state)))
          (my/close-sidebars))))))

(add-hook 'buffer-list-update-hook #'my/sidebar-sync-visibility-h)
(add-hook 'window-selection-change-functions #'my/sidebar-sync-visibility-h)

(message "sidebar-tools.el loaded")
(provide 'sidebar-tools)
;;; sidebar-tools.el ends here
