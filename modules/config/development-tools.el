(after! lsp-mode
  (setq lsp-enable-symbol-highlighting t
        lsp-enable-on-type-formatting nil))

(after! company
  (setq company-idle-delay 0.2
        company-minimum-prefix-length 1))

(provide 'development-tools)
;;; development-tools.el ends here
