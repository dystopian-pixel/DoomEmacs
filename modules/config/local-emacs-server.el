(require 'simple-httpd) ;; Make sure simple-httpd is installed

(setq httpd-port 8123) ;; Port for local Emacs HTTP server

;; /ping endpoint: returns "pong" for health checks
(defservlet* ping text/plain (path query req)
  (httpd-send-header proc "text/plain" 200 :body "pong"))

(setq httpd-root doom-user-dir)

;; Ensure theme-preview images are served correctly
(add-to-list 'httpd-mime-types '("png" . "image/png"))

;; /switch-theme endpoint: expects ?name=theme as a query parameter
(require 'simple-httpd)  ;; HTTP server for Emacs

(defvar my/theme-switch-port 8123
  "Port number for the local Emacs theme-switch HTTP server.")

;; Handler for theme switching requests
(defun my/httpd-theme-switch-handler (proc path query req)
  (if (string-match "/switch-theme" path)
      (let* ((params (url-parse-query-string (or query "")))
             (theme-name (cadr (assoc "name" params))))
        (if (not theme-name)
            (progn
              (httpd-send-header proc "text/plain" 400)
              (process-send-string proc "Missing theme name!"))
          (let ((theme (intern theme-name)))
            (if (member theme (custom-available-themes))
                (progn
                  (mapc #'disable-theme custom-enabled-themes)
                  (load-theme theme t)
                  (setq doom-theme theme)
                  (httpd-send-header proc "text/plain" 200)
                  (process-send-string proc (format "Theme %s switched!" theme-name)))
              (progn
                (httpd-send-header proc "text/plain" 404)
                (process-send-string proc (format "Theme %s not found" theme-name)))))))
    (httpd-send-header proc "text/plain" 404)
    (process-send-string proc "Not found")))


(setq httpd-port my/theme-switch-port)

(defservlet* switch-theme text/plain (path query req)
  (my/httpd-theme-switch-handler proc path query req))

(defun my/httpd-start-safe (&optional quiet)
  "Start simple-httpd without aborting if the port is already in use.
When QUIET is non-nil, suppress informational startup messages."
  (interactive)
  (condition-case err
      (unless (httpd-running-p)
        (httpd-start)
        (unless quiet
          (message "simple-httpd started on port %s" httpd-port)))
    (file-error
     (unless quiet
       (message "simple-httpd not started: %s" (error-message-string err))))))

(my/httpd-start-safe t)

(defvar my/theme-gallery-theme nil
  "Currently selected theme in the theme gallery.")

(defservlet my-theme-gallery "text/plain" (theme)
  (let* ((theme-name (car (last (split-string theme "/" t))))
         (theme-symbol (and theme-name (intern theme-name)))
         (themes (custom-available-themes)))
    (if (and theme-symbol (member theme-symbol themes))
        (progn
          (load-theme theme-symbol t)
          (setq my/theme-gallery-theme theme-symbol)
          (princ (format "Theme switched to: %s" theme-symbol)))
      (princ "Invalid theme"))))

(provide 'local-emacs-server)
(message "✅ local-emacs-server.el loaded")
