(defun my/org-auto-tangle-message()
  (message " org-auto-tangle: tangled %s" (buffer-file-name)))

(advice-add 'org-auto-tangle--tangle-file :after #'my/org-auto-tangle-message)
;; test
(use-package! org-auto-tangle
  :hook (org-mode.org-auto-tangle-mode)
  :config
  (setq org-auto-tangle-default t))

(setq ispell-alternate-dictionary "/usr/share/dict/words")
