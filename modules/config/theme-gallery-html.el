;;; theme-gallery-html.el --- Generate a clickable HTML gallery for Emacs themes

(defvar my/theme-gallery-dir (expand-file-name "theme-gallery/" doom-user-dir))
(defvar my/theme-gallery-html (expand-file-name "theme-gallery.html" my/theme-gallery-dir))

(defun my/theme-gallery--html-head ()
  "Generate the <head> and style for the gallery."
  (concat
   "<!DOCTYPE html>
<html lang=\"en\">
<head>
  <meta charset=\"UTF-8\">
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
  <title>Doom Emacs Theme Gallery</title>
  <style>
    body { background: #181825; color: #cdd6f4; margin: 0; font-family: system-ui,sans-serif; }
    .gallery { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 32px; padding: 2em; }
    .theme-thumb { background-size: cover; background-position: center; width: 180px; height: 120px; margin: 0 auto 0.5em auto; border-radius: 10px; box-shadow: 0 2px 8px #0005; border: 2px solid #313244; cursor: pointer; transition: border 0.2s, box-shadow 0.2s; }
    .theme-thumb:hover { border-color: #89b4fa; box-shadow: 0 4px 20px #89b4fa80; }
    .theme-name { text-align: center; font-size: 1em; font-family: monospace; }
    @media (max-width: 700px) { .gallery { grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); } .theme-thumb { width: 110px; height: 72px; } }
  </style>
</head>
<body>
  <h1 style=\"text-align:center;font-size:1.8em;letter-spacing:0.08em\">Doom Emacs Theme Gallery</h1>
  <div class=\"gallery\">
"))

(defun my/theme-gallery--html-end ()
  "</div>
<script>
function switchTheme(themeName) {
  fetch('http://localhost:8123/switch-theme?name=' + encodeURIComponent(themeName)).then(r=>r.text());
}
document.querySelectorAll('.theme-thumb').forEach(function(div) {
  div.addEventListener('click', function() {
    switchTheme(this.dataset.theme);
  });
});
</script>
</body></html>
")

(defun my/generate-theme-gallery-html ()
  "Generate a clickable, responsive HTML theme gallery with JS for switching themes."
  (interactive)
  (unless (file-directory-p my/theme-gallery-dir)
    (make-directory my/theme-gallery-dir t))
  (let ((themes (custom-available-themes)))
    (with-temp-file my/theme-gallery-html
      (insert (my/theme-gallery--html-head))
      (dolist (theme themes)
        (let* ((img-file (expand-file-name (format "%s.png" theme) my/theme-gallery-dir))
               (img-url (file-name-nondirectory img-file))
               (theme-name (symbol-name theme)))
          (when (file-exists-p img-file)
            (insert
             (format "<div style='display:flex;flex-direction:column;align-items:center'>"
                     ))
            (insert (format
                     "<div class=\"theme-thumb\" title=\"%s\" data-theme=\"%s\" style=\"background-image:url('%s')\"></div>"
                     theme-name theme-name img-url))
            (insert (format "<div class=\"theme-name\">%s</div>" theme-name))
            (insert "</div>\n"))))
      (insert (my/theme-gallery--html-end)))
    (message "✅ Theme gallery HTML generated: %s" my/theme-gallery-html)))

(provide 'theme-gallery-html)
