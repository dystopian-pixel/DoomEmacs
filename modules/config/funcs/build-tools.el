;; [[file:../../org/funcs/build-tools.org::*Module prologue][Module prologue:1]]
;;; build-tools.el --- Build helpers for CMake & Make -*- lexical-binding: t; -*-

(require 'compile)

(defun my--bt--project-root ()
  "Best-effort project root."
  (or (when (fboundp 'projectile-project-root)
        (ignore-errors (projectile-project-root)))
      (when-let ((proj (ignore-errors (project-current))))
        (ignore-errors (project-root proj)))
      default-directory))

(defun my--bt--recent-executable (dir)
  "Return a most-recently-modified executable file under DIR, or nil."
  (when (file-directory-p dir)
    (let* ((candidates
            (seq-filter (lambda (f)
                          (and (file-regular-p f)
                               (file-executable-p f)))
                        (directory-files-recursively dir ".*" t)))
           (sorted (sort candidates #'file-newer-than-file-p)))
      (car sorted))))
;; Module prologue:1 ends here

;; [[file:../../org/funcs/build-tools.org::*CMake: build and run][CMake: build and run:1]]
;;;###autoload
(defun my/cmake-build-and-run ()
  "Configure + build with CMake, then attempt to run the freshest executable from the build dir.

- Configure:  cmake -S <root> -B <root>/build
- Build:      cmake --build <root>/build
- Run:        most recently modified executable under <root>/build (if any)."
  (interactive)
  (let* ((root (file-name-as-directory (my--bt--project-root)))
         (build (expand-file-name "build" root))
         (default-directory root)
         (cmd (format "cmake -S %s -B %s && cmake --build %s"
                      (shell-quote-argument root)
                      (shell-quote-argument build)
                      (shell-quote-argument build))))
    (unless (file-directory-p build)
      (make-directory build t))
    (compile cmd)
    ;; Try to run after a short delay; if build is long, user can re-run manually or call again.
    (run-at-time
     1 nil
     (lambda ()
       (let ((exe (my--bt--recent-executable build)))
         (when exe
           (let ((default-directory (file-name-directory exe)))
             (async-shell-command (shell-quote-argument exe)))))))))
;; CMake: build and run:1 ends here

;; [[file:../../org/funcs/build-tools.org::*Make: build][Make: build:1]]
;;;###autoload
(defun my/makefile-build (&optional target)
  "Run `make' (or TARGET) in the project root."
  (interactive)
  (let* ((root (file-name-as-directory (my--bt--project-root)))
         (default-directory root)
         (jobs (or (getenv "MAKEFLAGS") (format "-j%d" (max 1 (num-processors)))))
         (cmd (format "make -k %s %s"
                      (or jobs "")
                      (or target ""))))
    (compile cmd)))
;; Make: build:1 ends here

;; [[file:../../org/funcs/build-tools.org::*Make: run][Make: run:1]]
(defun my--bt--has-make-target-p (target)
  "Heuristically check if a Makefile TARGET exists."
  (when (file-readable-p "Makefile")
    (with-temp-buffer
      (insert-file-contents "Makefile")
      (goto-char (point-min))
      (re-search-forward (format "^[[:space:]]*%s\\s*:" (regexp-quote target)) nil t))))

;;;###autoload
(defun my/makefile-run ()
  "Run the project via `make run' if available; otherwise execute the freshest binary in ./build or ./bin."
  (interactive)
  (let* ((root (file-name-as-directory (my--bt--project-root)))
         (default-directory root))
    (cond
     ((my--bt--has-make-target-p "run")
      (compile "make run"))
     (t
      (let* ((cand (or (my--bt--recent-executable (expand-file-name "build" root))
                       (my--bt--recent-executable (expand-file-name "bin" root)))))
        (if cand
            (let ((default-directory (file-name-directory cand)))
              (async-shell-command (shell-quote-argument cand)))
          (user-error "No `run' target and no executable found in build/ or bin/")))))))
;; Make: run:1 ends here

;; [[file:../../org/funcs/build-tools.org::*Module epilogue][Module epilogue:1]]
(provide 'build-tools)
;;; build-tools.el ends here
;; Module epilogue:1 ends here
