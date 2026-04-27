;;; -*- lexical-binding: t; -*-
(defun my/ensure-font-lock ()
  "Ensure font-lock is applied to the whole buffer."
  (font-lock-ensure))
(add-hook 'find-file-hook #'my/ensure-font-lock)
(defun my/org-auto-tangle-message()
  (message " org-auto-tangle: tangled %s" (buffer-file-name)))

(advice-add 'org-auto-tangle--tangle-file :after #'my/org-auto-tangle-message)
;; test
(use-package! org-auto-tangle
  :hook (org-mode . org-auto-tangle-mode)
  :init
  (setq org-auto-tangle-default t))
(use-package! define-word
  :commands (define-word lookup-dictionary))
(message "☑️ general-helpers.el loaded")
(provide 'general-helpers)
