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

(defvar my/sidebar-left-width 30
  "Fixed width, in columns, for the left sidebar column.")

(defvar my/sidebar-minimap-width 18
  "Fixed width, in columns, for the right minimap sidebar.")

(defvar my/minimap-scroll-lines 5
  "Number of source-buffer lines to scroll from minimap mouse-wheel events.")

(defvar my/minimap--source-window nil
  "Last real editing window used as the minimap scroll target.")

(defvar my/sidebar--normalizing-layout nil
  "Non-nil while sidebar layout normalization is running.")

(defun my/tramp-buffer-p ()
  "Return non-nil when the current buffer/default-directory is remote or sudo."
  (file-remote-p (or buffer-file-name default-directory)))

(defun my/sidebar-file-buffer-p (&optional buffer)
  "Return non-nil when BUFFER is a local real file-visiting buffer.

Remote/TRAMP buffers are deliberately excluded so sidebar synchronization does
not cause extra sudo/TRAMP probes after opening privileged files."
  (let* ((buf  (get-buffer (or buffer (current-buffer))))
         (file (and (buffer-live-p buf)
                    (buffer-file-name buf))))
    (and file
         (not (file-remote-p file))
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
  my/sidebar-left-width)

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
(defun my/sidebar--hide-tabs-in-buffer (&optional buffer)
  "Hide tab/header UI in sidebar BUFFER."
  (when-let ((buf (get-buffer (or buffer (current-buffer)))))
    (with-current-buffer buf
      (setq-local header-line-format nil)
      (setq-local tab-line-format nil)
      ;; Doom's tabs module may use package-specific buffer-local hiding knobs.
      (setq-local tab-bar-format nil)
      (setq-local centaur-tabs-hide-tabs t)
      (setq-local awesome-tab-hide-tabs t))))

(defun my/sidebar--hide-tabs-in-window (&optional window)
  "Hide tab/header UI in WINDOW's buffer."
  (let ((win (or window (selected-window))))
    (when (window-live-p win)
      (my/sidebar--hide-tabs-in-buffer (window-buffer win)))))

(defun my/minimap-window ()
  "Return the visible minimap window, if any."
  (when-let ((buf (my/minimap--buffer)))
    (get-buffer-window buf t)))

(defun my/sidebar--resize-window-width (window cols)
  "Resize WINDOW horizontally to COLS columns as closely as possible."
  (when (window-live-p window)
    (let ((window-size-fixed nil)
          (ignore-window-parameters t)
          (window-min-width 1))
      (dotimes (_ 4)
        (let ((delta (- cols (window-total-width window))))
          (unless (zerop delta)
            (ignore-errors
              (window-resize window delta t t))
            (let ((remaining (- cols (window-total-width window))))
              (unless (zerop remaining)
                (ignore-errors
                  (adjust-window-trailing-edge window remaining t))))))))))

(defun my/sidebar-main-windows (&optional frame)
  "Return non-sidebar windows in FRAME."
  (cl-remove-if
   #'my/sidebar-window-p
   (window-list (or frame (selected-frame)) 'nomini)))

(defun my/sidebar--window-row-key (window)
  "Return a stable visual row key for WINDOW."
  (let ((edges (window-edges window)))
    (list (nth 1 edges) (nth 3 edges))))

(defun my/sidebar--balance-window-row (windows)
  "Make non-sidebar WINDOWS in the same visual row equal width."
  (let* ((wins (sort (cl-remove-if-not #'window-live-p windows)
                     (lambda (a b)
                       (< (car (window-edges a))
                          (car (window-edges b))))))
         (count (length wins)))
    (when (> count 1)
      (let* ((total (apply #'+ (mapcar #'window-total-width wins)))
             (target (/ total count))
             (window-size-fixed nil)
             (ignore-window-parameters t))
        (dolist (win (butlast wins))
          (when (window-live-p win)
            (ignore-errors
              (window-resize win
                             (- target (window-total-width win))
                             t t))))))))

(defun my/sidebar-balance-main-window-rows ()
  "Balance non-sidebar editing windows row by row."
  (dolist (row (seq-group-by #'my/sidebar--window-row-key
                             (my/sidebar-main-windows)))
    (my/sidebar--balance-window-row (cdr row))))


(defun my/minimap-active-source-window ()
  "Return the active file-editing window that minimap should follow."
  (let ((win (selected-window)))
    (or (and (window-live-p win)
             (not (my/sidebar-window-p win))
             (my/sidebar-file-buffer-p (window-buffer win))
             win)
        (and (window-live-p my/minimap--source-window)
             (not (my/sidebar-window-p my/minimap--source-window))
             (my/sidebar-file-buffer-p (window-buffer my/minimap--source-window))
             my/minimap--source-window)
        (my/sidebar-main-window))))

(defun my/minimap-window-next-to-source-p (minimap-window source-window)
  "Return non-nil when MINIMAP-WINDOW is beside SOURCE-WINDOW in the same row."
  (and (window-live-p minimap-window)
       (window-live-p source-window)
       (equal (my/sidebar--window-row-key minimap-window)
              (my/sidebar--window-row-key source-window))
       (>= (car (window-edges minimap-window))
           (nth 2 (window-edges source-window)))))

(defun my/minimap--clamp-window (window)
  "Clamp WINDOW to `my/sidebar-minimap-width'."
  (when (window-live-p window)
    (let ((dedicated (window-dedicated-p window)))
      (set-window-dedicated-p window nil)
      (set-window-parameter window 'window-size-fixed nil)
      (my/sidebar--resize-window-width window my/sidebar-minimap-width)
      (set-window-parameter window 'window-size-fixed 'width)
      (set-window-parameter window 'no-other-window t)
      (set-window-parameter window 'no-delete-other-windows t)
      (set-window-dedicated-p window dedicated)
      (set-window-dedicated-p window t)
      (my/minimap-install-scroll-bindings))))

(defun my/minimap-place-next-to-active-window ()
  "Display minimap as a sidecar for the active editing window."
  (when-let* ((buf (my/minimap--buffer))
              (source (my/minimap-active-source-window)))
    (when (and (window-live-p source)
               (not (my/sidebar-window-p source)))
      (let ((existing (my/minimap-window)))
        (unless (and (window-live-p existing)
                     (my/minimap-window-next-to-source-p existing source))
          (when (and (window-live-p existing)
                     (not (eq existing source)))
            (ignore-errors
              (delete-window existing)))
          (setq existing
                (let ((display-buffer-overriding-action nil))
                  (display-buffer-in-direction
                   buf
                   `((direction . right)
                     (window . ,source)
                     (window-width . ,my/sidebar-minimap-width)
                     (window-parameters
                      . ((no-other-window . t)
                         (no-delete-other-windows . t)
                         (window-size-fixed . width))))))))
        (when (window-live-p existing)
          (my/minimap--clamp-window existing)
          (ignore-errors
            (with-selected-window source
              (when (fboundp 'minimap-update)
                (minimap-update))
              (when (fboundp 'minimap-recenter)
                (minimap-recenter)))))))))

(defun my/minimap-follow-active-window-h (&rest _)
  "Make minimap follow the selected file-editing window."
  (my/minimap-remember-source-window)
  (when (bound-and-true-p minimap-mode)
    (my/sidebar-schedule-normalize-layout)))

(defun my/minimap-setup ()
  "Keep minimap beside the active file-editing window."
  (when (bound-and-true-p minimap-mode)
    (my/minimap-place-next-to-active-window)
    (when-let ((win (my/minimap-window)))
      (my/minimap--clamp-window win))))

(defun my/sidebar-normalize-layout (&rest _)
  "Normalize sidebar widths and balance editing windows after layout changes."
  (unless my/sidebar--normalizing-layout
    (let ((my/sidebar--normalizing-layout t))
      ;; Treemacs and iMenu remain full-height left sidebars.
      (when-let ((win (my/treemacs-window)))
        (my/sidebar--resize-window-width win my/sidebar-left-width)
        (set-window-parameter win 'window-size-fixed 'width)
        (set-window-parameter win 'no-other-window t)
        (set-window-parameter win 'no-delete-other-windows t)
        (set-window-dedicated-p win t))
      (when-let ((win (my/imenu-list-window)))
        (my/sidebar--resize-window-width win my/sidebar-left-width)
        (set-window-parameter win 'window-size-fixed 'width)
        (set-window-parameter win 'no-other-window t)
        (set-window-parameter win 'no-delete-other-windows t)
        (set-window-dedicated-p win t)
        (my/sidebar--hide-tabs-in-window win))
      ;; Minimap follows the active editing window, not the full frame.
      (when (and (bound-and-true-p minimap-mode)
                 (my/minimap--buffer))
        (my/minimap-setup))
      ;; Balance only real editing windows, row by row.
      (my/sidebar-balance-main-window-rows)
      ;; Re-clamp minimap after balancing.
      (when (and (bound-and-true-p minimap-mode)
                 (my/minimap-window))
        (my/minimap--clamp-window (my/minimap-window))))))

(defun my/sidebar-schedule-normalize-layout (&rest _)
  "Schedule repeated sidebar normalization after window changes."
  (dolist (delay '(0.01 0.05 0.15 0.35))
    (run-at-time delay nil #'my/sidebar-normalize-layout)))

(defun my/minimap-remember-source-window (&rest _)
  "Remember the selected real editing window for minimap scrolling."
  (let ((win (selected-window)))
    (when (and (window-live-p win)
               (not (my/sidebar-window-p win))
               (my/sidebar-file-buffer-p (window-buffer win)))
      (setq my/minimap--source-window win))))

(defun my/minimap-source-window ()
  "Return the window that minimap mouse-wheel events should scroll."
  (or (and (window-live-p my/minimap--source-window)
           (not (my/sidebar-window-p my/minimap--source-window))
           my/minimap--source-window)
      (my/sidebar-main-window)))

(defun my/minimap-scroll-source-window (direction)
  "Scroll the minimap source window in DIRECTION.

DIRECTION should be `up' to move toward the beginning of the buffer, or
`down' to move toward the end of the buffer."
  (let ((target (my/minimap-source-window))
        (origin (selected-window)))
    (unless (window-live-p target)
      (user-error "No source window available for minimap scrolling"))
    (with-selected-window target
      (condition-case nil
          (pcase direction
            ('up
             (scroll-down-command my/minimap-scroll-lines))
            ('down
             (scroll-up-command my/minimap-scroll-lines)))
        (beginning-of-buffer nil)
        (end-of-buffer nil)))
    (when (window-live-p origin)
      (select-window origin))
    (my/sidebar-schedule-normalize-layout)))

(defun my/minimap-wheel-up (_event)
  "Scroll the source buffer up from the minimap."
  (interactive "e")
  (my/minimap-scroll-source-window 'up))

(defun my/minimap-wheel-down (_event)
  "Scroll the source buffer down from the minimap."
  (interactive "e")
  (my/minimap-scroll-source-window 'down))

(defun my/minimap-install-scroll-bindings ()
  "Make mouse-wheel events in the minimap scroll the source buffer."
  (when-let ((buf (my/minimap--buffer)))
    (with-current-buffer buf
      (let ((map (copy-keymap (or (current-local-map)
                                  (make-sparse-keymap)))))
        (define-key map [wheel-up] #'my/minimap-wheel-up)
        (define-key map [wheel-down] #'my/minimap-wheel-down)
        (define-key map [double-wheel-up] #'my/minimap-wheel-up)
        (define-key map [double-wheel-down] #'my/minimap-wheel-down)
        (define-key map [triple-wheel-up] #'my/minimap-wheel-up)
        (define-key map [triple-wheel-down] #'my/minimap-wheel-down)
        ;; Some builds/toolkits report wheel movement as mouse-4/mouse-5.
        (define-key map [mouse-4] #'my/minimap-wheel-up)
        (define-key map [mouse-5] #'my/minimap-wheel-down)
        (use-local-map map)))))
;;; --- Minimap ---------------------------------------------------------------

(with-eval-after-load 'minimap
  (setq minimap-window-location 'right
        minimap-width-fraction 0.12
        minimap-minimum-width my/sidebar-minimap-width
        minimap-dedicated-window t)

  (dolist (mode '(org-mode text-mode conf-mode))
    (cl-pushnew mode minimap-major-modes))

  (add-hook 'minimap-mode-hook
            (lambda ()
              (when minimap-mode
                (my/minimap-remember-source-window)
                (my/sidebar-schedule-normalize-layout)
                (run-at-time 0.05 nil #'my/minimap-install-scroll-bindings)))))

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
  (my/minimap-remember-source-window)
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
      (my/sidebar-schedule-normalize-layout))))

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

(run-with-idle-timer
 3 nil
 (lambda ()
   "Warm-load Treemacs after startup so the first manual toggle is faster."
   (require 'treemacs nil t)))

(defun my/imenu-list-refresh-layout ()
  "Normalize the visible *Ilist* sidebar."
  (interactive)
  (when-let ((win (my/imenu-list-window)))
    (my/sidebar--hide-tabs-in-window win)
    (set-window-parameter win 'window-size-fixed 'width)
    (set-window-parameter win 'no-other-window t)
    (set-window-parameter win 'no-delete-other-windows t)
    (set-window-dedicated-p win t)
    (my/sidebar--resize-window-width win my/sidebar-left-width)
    (my/sidebar-schedule-normalize-layout)))

;;;###autoload
(defun my/toggle-treemacs ()
  "Toggle Treemacs using Doom's native command when available."
  (interactive)
  (unless (or (fboundp '+treemacs/toggle)
              (require 'treemacs nil t))
    (user-error "treemacs is not available"))
  (unless (or (my/sidebar-eligible-buffer)
              (window-live-p (my/treemacs-window)))
    (user-error "Open a file-visiting buffer first"))
  (when (my/sidebar-eligible-buffer)
    (setq my/sidebar--suspended-state nil))
  (my/sidebar-call-from-main-window
   (lambda ()
     (cond
      ((fboundp '+treemacs/toggle)
       (+treemacs/toggle))
      ;; Raw `treemacs' is only a fallback.  We avoid all file-follow/project
      ;; commands because they were causing Dired jumps.
      ((fboundp 'treemacs)
       (treemacs))
      (t
       (user-error "No Treemacs toggle command is available")))))
  (my/sidebar-schedule-normalize-layout)
  (run-at-time
   0.05 nil
   (lambda ()
     (my/sidebar-schedule-normalize-layout)
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
                         (window-width . ,my/sidebar-left-width)
                         (window-parameters
                          . ((no-other-window . t)
                             (no-delete-other-windows . t)
                             (window-size-fixed . width)))))))
      (my/sidebar--hide-tabs-in-buffer buffer)
      (my/sidebar--hide-tabs-in-window win)
      (set-window-parameter win 'window-size-fixed 'width)
      (set-window-parameter win 'no-other-window t)
      (set-window-parameter win 'no-delete-other-windows t)
      (set-window-dedicated-p win t)
      (my/sidebar--resize-window-width win my/sidebar-left-width)
      win))

  (setq display-buffer-alist
        (cl-remove-if
         (lambda (entry)
           (and (consp entry)
                (stringp (car entry))
                (string-match-p "\` ?\*Ilist\*\'" (car entry))))
         display-buffer-alist))

  (add-to-list 'display-buffer-alist
               '("\` ?\*Ilist\*\'" my/display-imenu-list))

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

(defun my/imenu-list-close ()
  "Close all windows showing the iMenu List buffer."
  (when-let ((buf (my/imenu-list-buffer)))
    (dolist (win (get-buffer-window-list buf nil t))
      (when (window-live-p win)
        (ignore-errors
          (delete-window win))))
    (when (get-buffer-window buf t)
      (quit-windows-on buf nil))))

;;;###autoload
(defun my/toggle-imenu-list ()
  "Toggle iMenu List from the main editing window and keep it on the left."
  (interactive)
  (unless (require 'imenu-list nil t)
    (user-error "imenu-list is not available"))
  (if (my/imenu-list-window)
      (my/imenu-list-close)
    (unless (my/sidebar-eligible-buffer)
      (user-error "Open a file-visiting buffer first"))
    (setq my/sidebar--suspended-state nil)
    (let ((display-buffer-overriding-action
           '(my/display-imenu-list)))
      (my/sidebar-call-from-main-window #'imenu-list-smart-toggle))
    (run-at-time
     0.01 nil
     (lambda ()
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
  (my/imenu-list-close)
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
(add-hook 'buffer-list-update-hook #'my/minimap-remember-source-window)
(add-hook 'window-selection-change-functions #'my/minimap-remember-source-window)
(add-hook 'window-selection-change-functions #'my/minimap-follow-active-window-h)
(add-hook 'window-configuration-change-hook #'my/sidebar-schedule-normalize-layout)
(add-hook 'window-size-change-functions #'my/sidebar-schedule-normalize-layout)
(when (boundp 'window-state-change-hook)
  (add-hook 'window-state-change-hook #'my/sidebar-schedule-normalize-layout))
(message "☑️ sidebar-tools.el loaded")
(provide 'sidebar-tools)
;;; sidebar-tools.el ends here
