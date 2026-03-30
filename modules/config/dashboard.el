(defgroup as/dashboard nil
  "Custom dashboard for Doom Emacs."
  :group 'startup)

(defcustom as/dashboard-max-projects 8
  "How many recent projects to show."
  :type 'integer)

(defcustom as/dashboard-max-recents 10
  "How many recent files to show if we ever need them."
  :type 'integer)

(defcustom as/dashboard-agenda-days 3
  "Show Org items due today and within this many days ahead."
  :type 'integer)

(defcustom as/dashboard-theme-cycle
  (when (boundp 'doom-theme)
    (list doom-theme 'doom-one 'doom-dracula 'doom-gruvbox))
  "Cycle through these themes with the dashboard button."
  :type '(repeat symbol))

(defcustom as/dashboard-key-moves
  '(
    ;; label                  key        command
    ("Toggle minimap"        "SPC t m"  my/toggle-minimap)
    ("Toggle imenu-list"     "SPC t i"  my/toggle-imenu-list)
    ("Toggle Treemacs"       "SPC t p"  my/toggle-treemacs)
    ("Toggle tabs"           "SPC t t"  centaur-tabs-mode)
    ("Toggle transparent"    "SPC t T"  as/toggle-transparency)

    ("Find file (sidebars)"  "SPC f f"  find-file)
    ("Find file (plain)"     "SPC f T"  find-file-other-window)
    ("Zathura: open file"    "SPC f z"  as/pdf-open-with-zathura)
    ("Compare 2 files"       "SPC f r"  ediff)

    ("Compile"               "SPC c c"  compile)
    ("Recompile"             "SPC c r"  recompile)

    ("Hydra: Buffers"        "SPC m h b" hydra-buffer/body)
    ("Hydra: Windows"        "SPC m h w" hydra-window/body)
    ("Hydra: Tabs"           "SPC m h t" hydra-tabs/body)
    ("Hydra: Git"            "SPC m h g" hydra-git/body)
    ("Hydra: Org"            "SPC m h o" hydra-org/body)
    )
  "Cheatsheet entries for the dashboard. Each item is (LABEL KEY COMMAND). Only commands that exist are shown."
  :type '(repeat (list (string :tag "Label") (string :tag "Key") (symbol :tag "Command"))))

(require 'cl-lib)
(require 'seq)
(eval-when-compile (require 'subr-x))
(require 'button)
(require 'project nil t)
(require 'projectile nil t)
(require 'org-agenda nil t)

(defun as/dashboard--line (s &optional face)
  (insert (propertize s 'face face) "\n"))

(defun as/dashboard--button (label &rest props)
  "Insert a dashboard button labeled LABEL.
Props may include :action (fn) and standard button properties."
  (let* ((action (plist-get props :action))
         (help   (or (plist-get props :help-echo) "")))
    (insert-text-button
     label
     'face 'doom-dashboard-menu-title
     'help-echo help
     'follow-link t
     'action (or action (lambda (_btn) (message "%s" label))))
    (insert "  ")))

(defun as/dashboard--maybe (label key cmd)
  "Create a small button for CMD if it exists."
  (when (and (symbolp cmd) (fboundp cmd))
    (as/dashboard--button
     (format "%s · %s" label key)
     :help-echo (format "%s (%s)" cmd key)
     :action (lambda (_btn) (call-interactively cmd)))))

(defun as/dashboard--theme-cycle ()
  (interactive)
  (unless as/dashboard-theme-cycle
    (user-error "as/dashboard-theme-cycle is empty"))
  (let* ((seq as/dashboard-theme-cycle)
         (idx (or (cl-position doom-theme seq) -1))
         (next (nth (mod (1+ idx) (length seq)) seq)))
    (load-theme next t)
    (setq doom-theme next)
    (message "Theme: %s" next)))

(defun as/dashboard--recent-projects ()
  (cond
   ((and (featurep 'projectile) (boundp 'projectile-recent-projects))
    (cl-subseq projectile-recent-projects 0 (min as/dashboard-max-projects (length projectile-recent-projects))))
   ((fboundp 'project-known-project-roots)
    (cl-subseq (project-known-project-roots) 0 (min as/dashboard-max-projects (length (project-known-project-roots)))))
   (t nil)))

(defun as/dashboard--org-collect (days)
  "Return list of (DAY HEADING FILE POS type) for items scheduled/deadline today..DAYS."
  (when (and (featurep 'org-agenda) (fboundp 'org-agenda-files))
    (let* ((files (org-agenda-files t))
           (today (time-to-days (current-time)))
           (limit (+ today (max 0 days)))
           out)
      (dolist (file files out)
        (with-current-buffer (or (find-buffer-visiting file) (find-file-noselect file))
          (org-with-wide-buffer
           (goto-char (point-min))
           (while (re-search-forward org-heading-regexp nil t)
             (let* ((sched (org-entry-get nil "SCHEDULED"))
                    (dead  (org-entry-get nil "DEADLINE"))
                    (pos   (point-marker))
                    (head  (nth 4 (org-heading-components)))
                    (file  (buffer-file-name)))
               (dolist (pair `((,sched . scheduled) (,dead . deadline)))
                 (pcase-let ((`(,ts . ,kind) pair))
                   (when ts
                     (let* ((day (ignore-errors (time-to-days (org-time-string-to-time ts)))))
                       (when (and day (<= today day) (<= day limit))
                         (push (list day head file pos kind) out))))))))))))))

(defun as/dashboard--goto-marker (m)
  (when (markerp m)
    (switch-to-buffer (marker-buffer m))
    (goto-char m)
    (org-show-entry)
    (org-reveal)))

(defmacro as/dashboard-section (title &rest body)
  "Insert a titled section with standard spacing."
  `(progn
     (insert (propertize ,title 'face 'doom-dashboard-menu-title) "\n")
     (insert (make-string (length ,title) ?=) "\n\n")
     ,@body
     (insert "\n")))

(defun as/dashboard-widget-quickstart ()
  (as/dashboard-section "Quick start"
    (as/dashboard--maybe "Open Project" "SPC p p" #'projectile-switch-project)
    (as/dashboard--maybe "Recent Files" "SPC f r" #'recentf-open-files)
    (as/dashboard--maybe "Agenda"       "SPC o a a" #'org-agenda)
    (as/dashboard--maybe "Capture"      "SPC o a c" #'org-capture)
    (as/dashboard--maybe "Terminal"     "SPC o t" #'vterm)
    (as/dashboard--maybe "Theme Gallery" "SPC h t" #'consult-theme)
    (insert "\n")))

(defun as/dashboard-widget-today ()
  (as/dashboard-section "Today"
    (if (not (featurep 'org-agenda))
        (as/dashboard--line "Org agenda not available." 'shadow)
      (let* ((items (as/dashboard--org-collect as/dashboard-agenda-days)))
        (if (null items)
            (as/dashboard--line "No scheduled/deadline items soon. Nice." 'shadow)
          (dolist (it (seq-take (sort items (lambda (a b) (< (car a) (car b))))
                                12))
            (pcase-let ((`(,day ,head ,file ,pos ,kind) it))
              (let* ((date (format-time-string "%Y-%m-%d (%a)" (days-to-time day)))
                     (txt (format "%s  %s  — %s" (if (eq kind 'deadline) "⏰" "📅") date head)))
                (insert-text-button txt
                                    'follow-link t
                                    'help-echo file
                                    'action (lambda (_btn) (as/dashboard--goto-marker pos)))
                (insert "\n")))))))))

(defun as/dashboard-widget-projects ()
  (as/dashboard-section "Projects & Workspaces"
    (let ((projs (as/dashboard--recent-projects)))
      (if (null projs)
          (as/dashboard--line "No projects yet (Projectile not ready?)." 'shadow)
        (dolist (p (seq-take projs as/dashboard-max-projects))
          (insert-text-button
           (abbreviate-file-name p)
           'follow-link t
           'action (lambda (_btn)
                     (when (fboundp 'projectile-switch-project-by-name)
                       (projectile-switch-project-by-name p))))
          (insert "\n"))))
    (when (featurep 'persp-mode)
      (as/dashboard--button "Restore Session"
        :help-echo "Load last Doom session"
        :action (lambda (_btn)
                  (when (fboundp 'doom/quickload-session)
                    (call-interactively #'doom/quickload-session)))))
    (insert "\n")))

(defun as/dashboard-widget-key-moves ()
  (as/dashboard-section "Your Key Moves"
    (let ((added 0))
      (dolist (row as/dashboard-key-moves)
        (pcase-let ((`(,label ,key ,cmd) row))
          (when (fboundp cmd)
            (setq added (1+ added))
            (as/dashboard--maybe label key cmd))))
      (if (= added 0)
          (as/dashboard--line "No key moves defined or commands missing." 'shadow)
        (insert "\n")))))

(defun as/dashboard-widget-ui-tools ()
  (as/dashboard-section "UI & Theme tools"
    (as/dashboard--button "Cycle Theme"
      :help-echo "Cycle through as/dashboard-theme-cycle"
      :action (lambda (_btn) (as/dashboard--theme-cycle)))
    (as/dashboard--maybe "Toggle word-wrap" "SPC t w" #'toggle-word-wrap)
    (as/dashboard--maybe "Toggle line-numbers" "SPC t l" #'doom/toggle-line-numbers)
    (insert "\n")))

(defun as/dashboard-widget-footer ()
  (let* ((v (format "Emacs %s  ·  Doom %s  ·  %s"
                    emacs-version
                    (or (bound-and-true-p doom-version) "unknown")
                    (format-time-string "%Y-%m-%d %H:%M"))))
    (insert "\n")
    (as/dashboard--line v 'shadow)))

(after! doom-dashboard
  ;; Use your widgets (set both aliases to be future-proof across builds)
  (setq +doom-dashboard-functions
        '(as/dashboard-widget-banner
          as/dashboard-widget-quickstart
          as/dashboard-widget-today
          as/dashboard-widget-projects
          as/dashboard-widget-key-moves
          as/dashboard-widget-ui-tools
          as/dashboard-widget-footer))
  (setq doom-dashboard-functions +doom-dashboard-functions)

  ;; Menu
  (setq +doom-dashboard-menu-sections
        '((:icon "" :desc "Find file" :action find-file)
          (:icon "" :desc "Open project" :action projectile-switch-project)
          (:icon "" :desc "Today’s agenda" :action org-agenda-list)
          (:icon "" :desc "Last session" :action doom/quickload-session)
          (:icon "" :desc "Open config.org"
           :action (lambda ()
                     (interactive)
                     (find-file (expand-file-name "config.org" doom-user-dir))))))
  (setq doom-dashboard-menu-sections +doom-dashboard-menu-sections)

  ;; Working directory policy
  (setq +doom-dashboard-pwd-policy 'home
        doom-dashboard-pwd-policy 'home))

(defun as/dashboard-widget-banner ()
  (when (fboundp 'doom-dashboard-widget-banner)
    (doom-dashboard-widget-banner)))

(defun as/open-dashboard (&optional frame)
  "Open or refresh the dashboard."
  (interactive)
  (+doom-dashboard/open (or frame (selected-frame))))
