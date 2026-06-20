;;; -*- lexical-binding: t; -*-
(defun my/ensure-font-lock ()
  "Ensure font-lock is applied to the whole buffer."
  (font-lock-ensure))
(add-hook 'find-file-hook #'my/ensure-font-lock)
(defvar my/org-auto-tangle-trusted-directories
  (list
   (expand-file-name "modules/org/" doom-user-dir)
   (expand-file-name "theme-gallery/" doom-user-dir))
  "Trusted Org directories where automatic tangling may be enabled.")

(defun my/org-auto-tangle-trusted-file-p (file)
  "Return non-nil when FILE is a trusted Doom config Org source."
  (and file
       (string-match-p "\\.org\\'" file)
       (seq-some
        (lambda (dir)
          (file-in-directory-p
           (file-truename file)
           (file-truename dir)))
        my/org-auto-tangle-trusted-directories)))

(defun my/org-auto-tangle-enable-maybe ()
  "Enable `org-auto-tangle-mode' only for trusted Doom config Org sources."
  (when (my/org-auto-tangle-trusted-file-p buffer-file-name)
    (setq-local org-auto-tangle-default t)
    (org-auto-tangle-mode 1)
    (message "org-auto-tangle enabled for %s"
             (abbreviate-file-name buffer-file-name))))

(use-package! org-auto-tangle
  :commands org-auto-tangle-mode
  :hook (org-mode . my/org-auto-tangle-enable-maybe)
  :init
  (setq org-auto-tangle-default nil))
(use-package! define-word
  :commands (define-word lookup-dictionary))
(message "☑️ general-helpers.el loaded")
(provide 'general-helpers)
