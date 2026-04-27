;;; language-support.el --- Python -*- lexical-binding: t; -*-

(use-package! python
  :mode ("\\.py\\'" . python-mode)
  :config
  (setq python-shell-interpreter "python3"))

(use-package! lsp-pyright
  :hook (python-mode . lsp!))

(with-eval-after-load 'cc-mode
  ;; Prefer classic modes for C/C++ file extensions.
  (dolist (entry '(("\\.c\\'"   . c-mode)
                   ("\\.h\\'"   . c-or-c++-mode)
                   ("\\.cc\\'"  . c++-mode)
                   ("\\.cp\\'"  . c++-mode)
                   ("\\.cpp\\'" . c++-mode)
                   ("\\.cxx\\'" . c++-mode)
                   ("\\.hh\\'"  . c++-mode)
                   ("\\.hpp\\'" . c++-mode)
                   ("\\.hxx\\'" . c++-mode)))
    (add-to-list 'auto-mode-alist entry))

  ;; Defuse tree-sitter remapping for the C family in this config.
  (setq major-mode-remap-alist
        (assq-delete-all 'c-mode major-mode-remap-alist))
  (setq major-mode-remap-alist
        (assq-delete-all 'c++-mode major-mode-remap-alist))
  (when (boundp 'major-mode-remap-defaults)
    (setq major-mode-remap-defaults
          (assq-delete-all 'c-mode major-mode-remap-defaults))
    (setq major-mode-remap-defaults
          (assq-delete-all 'c++-mode major-mode-remap-defaults))))

(message "✅ language-support.el loaded")
(provide 'language-support)
;;; language-support.el ends here
