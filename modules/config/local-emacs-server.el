(require 'simple-httpd)
(require 'url-util)
(require 'json) ;; Make sure simple-httpd is installed

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


(defvar my/theme-gallery-last-apply nil
  "Last live theme-gallery apply result.")

(defun my/theme-gallery--theme-symbol (theme-name)
  "Return a theme symbol from THEME-NAME."
  (when (and theme-name (not (string-empty-p theme-name)))
    (intern (url-unhex-string theme-name))))

(defun my/theme-gallery--apply-theme-live (theme)
  "Apply THEME immediately using Doom's live theme reload path."
  (unless (and (symbolp theme)
               (member theme (custom-available-themes)))
    (user-error "Theme %s is not available" theme))

  ;; This mirrors the working interactive path in `my/theme-choose':
  ;; set `doom-theme', then ask Doom to reload the theme live.
  (setq doom-theme theme)

  ;; Make the selected theme the only active color theme before Doom reloads it.
  (mapc #'disable-theme custom-enabled-themes)
  (load-theme theme t)

  ;; Persist for next restart.
  (cond
   ((fboundp 'my/save-theme)
    (my/save-theme theme))
   ((fboundp 'my/write-last-theme-file)
    (my/write-last-theme-file theme))
   ((boundp 'my/last-theme-file)
    (with-temp-file my/last-theme-file
      (insert (format "(setq doom-theme '%S)\n" theme)))))

  ;; Let Doom re-run its theme hooks/faces/font refresh for the live daemon.
  (when (fboundp 'doom/reload-theme)
    (doom/reload-theme))

  (dolist (frame (frame-list))
    (when (display-graphic-p frame)
      (with-selected-frame frame
        (set-frame-parameter frame 'background-color
                             (face-background 'default nil t))
        (set-frame-parameter frame 'foreground-color
                             (face-foreground 'default nil t)))))
  (force-mode-line-update t)
  (redraw-display)
  theme)

;; Handler for theme switching requests
(defun my/httpd-theme-switch-handler (proc path query req)
  "Handle /switch-theme?name=THEME and apply THEME live."
  (if (string-match "/switch-theme" path)
      (let* ((params (url-parse-query-string (or query "")))
             (theme-name (cadr (assoc "name" params)))
             (theme (my/theme-gallery--theme-symbol theme-name)))
        (condition-case err
            (progn
              (my/theme-gallery--apply-theme-live theme)
              (httpd-send-header proc "text/plain" 200)
              (process-send-string
               proc
               (format "Theme switched live to: %s" theme)))
          (error
           (httpd-send-header proc "text/plain" 400)
           (process-send-string
            proc
            (format "Theme switch failed: %s"
                    (error-message-string err))))))
    (httpd-send-header proc "text/plain" 404)
    (process-send-string proc "Not found")))


(setq httpd-host "127.0.0.1")
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
  "Apply THEME from the browser gallery immediately."
  (let* ((theme-name (car (last (split-string theme "/" t))))
         (theme-symbol (my/theme-gallery--theme-symbol theme-name)))
    (condition-case err
        (progn
          (my/theme-gallery--apply-theme-live theme-symbol)
          (setq my/theme-gallery-theme theme-symbol)
          (princ (format "Theme switched live to: %s" theme-symbol)))
      (error
       (setf (httpd-header-status req) "400 Bad Request")
       (princ (format "Theme switch failed: %s"
                      (error-message-string err)))))))

(defservlet my-theme-gallery "text/plain" (theme)
  "Apply THEME from the browser gallery immediately."
  (let* ((theme-name (car (last (split-string theme "/" t))))
         (theme-symbol (my/theme-gallery--theme-symbol theme-name)))
    (condition-case err
        (progn
          (my/theme-gallery--apply-theme-live theme-symbol)
          (setq my/theme-gallery-theme theme-symbol)
          (princ (format "Theme switched live to: %s\n%S"
                         theme-symbol
                         my/theme-gallery-last-apply)))
      (error
       (setf (httpd-header-status req) "400 Bad Request")
       (princ (format "Theme switch failed: %s"
                      (error-message-string err)))))))

(provide 'local-emacs-server)
(message "✅ local-emacs-server.el loaded")
