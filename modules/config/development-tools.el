;;; development-tools.el --- Development tooling tweaks -*- lexical-binding: t; -*-

(defun my/tramp-buffer-p ()
  "Return non-nil when the current buffer/default-directory is remote or sudo."
  (file-remote-p (or buffer-file-name default-directory)))

;; lsp-mode can try to discover/start language servers through TRAMP.  That is
;; especially noisy in /sudo: buffers, where probes such as file attributes and
;; executable lookup run through sudo.  Keep LSP local-only unless you explicitly
;; opt into remote LSP later.
(setq lsp-auto-register-remote-clients nil)

(after! lsp-mode
  (setq lsp-auto-register-remote-clients nil
        lsp-enable-symbol-highlighting t
        lsp-enable-on-type-formatting nil)

  (defadvice! my/lsp-skip-tramp-a (fn &rest args)
    "Do not start `lsp' in TRAMP buffers, including /sudo:."
    :around #'lsp
    (unless (my/tramp-buffer-p)
      (apply fn args)))

  (defadvice! my/lsp-deferred-skip-tramp-a (fn &rest args)
    "Do not start `lsp-deferred' in TRAMP buffers, including /sudo:."
    :around #'lsp-deferred
    (unless (my/tramp-buffer-p)
      (apply fn args))))

;;
;;; Native compilation temp directory

(defun my/native-comp-temp-dir ()
  "Return Doom's native-comp temporary directory, creating it safely."
  (let ((dir (file-name-as-directory
              (expand-file-name "comp" doom-profile-cache-dir))))
    (unless (file-directory-p dir)
      (make-directory dir t))
    dir))

(when (boundp 'native-comp-eln-load-path)
  ;; Doom redirects async native-comp temporary files into
  ;; `doom-profile-cache-dir'/comp.  On Emacs 30/Nix, the async worker startup
  ;; can still emit "File already exists" for that directory.  Replace Doom's
  ;; stock wrapper with a guarded one and give native-comp a safe local
  ;; `default-directory' while workers are started.
  (with-eval-after-load 'comp
    (when (fboundp 'comp-run-async-workers@dont-litter-tmpdir)
      (advice-remove 'comp-run-async-workers
                     #'comp-run-async-workers@dont-litter-tmpdir))

    (defadvice! my/comp-run-async-workers-safe-tmpdir-a (fn &rest args)
      "Start native-comp workers in a stable Doom cache directory."
      :around #'comp-run-async-workers
      (let* ((temporary-file-directory (my/native-comp-temp-dir))
             (default-directory temporary-file-directory))
        (condition-case err
            (apply fn args)
          (file-error
           (if (and (eq (car-safe err) 'file-already-exists)
                    (let ((path (nth 2 err)))
                      (and (stringp path)
                           (file-equal-p path temporary-file-directory))))
               nil
             (signal (car err) (cdr err)))))))))

(after! company
  (setq company-idle-delay 0.2
        company-minimum-prefix-length 1))

(provide 'development-tools)
;;; development-tools.el ends here
