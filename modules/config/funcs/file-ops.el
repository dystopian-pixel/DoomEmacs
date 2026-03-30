;; [[file:../../org/funcs/file-ops.org::*Module prologue][Module prologue:1]]
;;; file-ops.el --- File operations and sidebar-aware finders -*- lexical-binding: t; -*-
;; Module prologue:1 ends here

;; [[file:../../org/funcs/file-ops.org::*Find file with sidebars][Find file with sidebars:1]]
;;;###autoload
(defun my/find-file-with-sidebars ()
  "Open a file, then ensure the usual sidebars are visible."
  (interactive)
  (call-interactively #'find-file)
  (ignore-errors
    (unless (window-live-p (my/treemacs-window))
      (my/toggle-treemacs)))
  (ignore-errors
    (unless (window-live-p (my/imenu-list-window))
      (my/toggle-imenu-list)))
  (ignore-errors
    (unless (bound-and-true-p minimap-mode)
      (my/toggle-minimap))))
;; Find file with sidebars:1 ends here

;; [[file:../../org/funcs/file-ops.org::*Open all files in a directory][Open all files in a directory:1]]
(defun my--file-ops--collect-files (dir include-hidden)
  "Return a list of absolute file paths in DIR.
If INCLUDE-HIDDEN is non-nil, include dotfiles. Skip directories and non-regulars."
  (let* ((rx (if include-hidden ".+" directory-files-no-dot-files-regexp))
         (paths (directory-files dir t rx)))
    (seq-filter #'file-regular-p paths)))

;;;###autoload
(defun my/open-all-files-in-directory (dir &optional include-hidden)
  "Open all regular files in DIR as buffers and show the first in the current window.
With prefix arg INCLUDE-HIDDEN, include dotfiles. All opened buffers are grouped
together in Centaur Tabs."
  (interactive "DDirectory: \nP")
  (let* ((dir   (file-name-as-directory (expand-file-name dir)))
         (files (my--file-ops--collect-files dir include-hidden)))
    (unless files (user-error "No regular files found"))
    (let* ((group (format "📁 %s" (abbreviate-file-name dir)))
           (buffers (mapcar #'find-file-noselect files)))
      ;; Tag each buffer with this batch's group (only affects Centaur Tabs)
      (dolist (b buffers)
        (with-current-buffer b
          (setq-local my/centaur-tabs-group group)))
      ;; Show the first file in the *current* window, avoiding display-buffer rules
      (let ((pop-up-windows nil)
            (display-buffer-overriding-action nil))
        (switch-to-buffer (car buffers)))
      ;; Clean up any *new* regular windows some mode hook created (keep side windows).
      (let ((main (selected-window)))
        (walk-windows
         (lambda (w)
           (unless (or (eq w main) (window-parameter w 'window-side))
             (delete-window w)))
         nil t)))))
;; Open all files in a directory:1 ends here

;; [[file:../../org/funcs/file-ops.org::*Module epilogue][Module epilogue:1]]
(provide 'file-ops)
;;; file-ops.el ends here
;; Module epilogue:1 ends here
