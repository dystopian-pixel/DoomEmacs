;; [[file:../org/functions.org::*Implementation][Implementation:1]]
;;; functions.el --- Load all funcs/*.el modules -*- lexical-binding: t; -*-

(defun my/functions-load-each ()
  "Load the set of function modules from a nearby ../config/funcs/ directory.
This is resilient to being moved around under ~/.config/doom/modules/*."
  (let* ((here (or load-file-name (buffer-file-name)))
         (base (file-name-directory here))
         ;; Try these candidates in order; load whatever exists.
         (candidates
          (list
           ;; If functions.el was tangled to ~/.config/doom/config/functions.el (preferred)
           (expand-file-name "funcs" (expand-file-name "config" (expand-file-name "~/.config/doom/")))
           ;; If someone tangled into modules-local config (fallback)
           (expand-file-name "funcs" (expand-file-name "../config" base))
           ;; If functions.el itself is in ~/.config/doom/config/, build funcs relative to it
           (expand-file-name "funcs" (file-name-directory (or load-file-name default-directory))))))
    (catch 'done
      (dolist (dir candidates)
        (when (file-directory-p dir)
          (dolist (m '("sidebar-tools.el"
                       "buffer-management.el"
                       "theming.el"
                       "pdf-tools-enhancements.el"
                       "general-helpers.el"
                       "file-ops.el"
                       "build-tools.el"))
            (let ((path (expand-file-name m dir)))
              (when (file-exists-p path)
                (load path nil 'nomessage))))
          (throw 'done t)))))
  (provide 'functions))

;; Load immediately at startup when this file is required.
(my/functions-load-each)
;; Implementation:1 ends here
