;;; language-support.el --- Python -*- lexical-binding: t; -*-

(use-package! python
  :mode ("\\.py\\'" . python-mode)
  :config
  (setq python-shell-interpreter "python3"))

(use-package! lsp-pyright
  :hook (python-mode . lsp!))

(provide 'language-support)
;;; language-support.el ends here
