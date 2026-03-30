(setq httpd-root (expand-file-name "theme-gallery/" doom-user-dir))
   ;; Set simple-httpd root folder to inside Doom Emacs folder

(defvar my/theme-gallery-themes nil
  "List of themes included in the gallery. If nil, use all available themes.")

(defvar my/theme-gallery-dir (expand-file-name "theme-gallery/" doom-user-dir)
  "Directory where theme screenshots are stored.")

(defvar my/theme-gallery-html (expand-file-name "theme-gallery.html" my/theme-gallery-dir)
  "Path to the generated theme gallery HTML file.")

(defvar my/doom-themes-list
  (custom-available-themes)
  "List of all available themes on this system.")

(unless (boundp 'my/last-theme-file)
  (defvar my/last-theme-file
    (expand-file-name "modules/config/.last-theme.el" doom-user-dir)
    "File used to persist the last selected theme."))

(defun my/save-theme (theme)
  "Persist THEME selection to be restored next session."
  (interactive "STheme: ")
  (setq doom-theme theme)
  (with-temp-file my/last-theme-file
    (insert (format "(setq doom-theme '%S)\n" theme))))

(defun my/load-last-theme ()
  "Load last saved theme or fallback to `doom-one`."
  (if (file-exists-p my/last-theme-file)
      (load my/last-theme-file nil t)
    (setq doom-theme 'doom-one)
    (my/save-theme doom-theme)))

(unless (fboundp 'my/persist-theme-a)
  (defun my/persist-theme-a (theme &rest _)
    "Persist THEME whenever it is enabled or loaded."
    (when (and (symbolp theme) (custom-theme-p theme))
      (setq doom-theme theme)
      (my/save-theme theme))))

(unless (advice-member-p #'my/persist-theme-a #'load-theme)
  (advice-add 'load-theme :after #'my/persist-theme-a))
(unless (advice-member-p #'my/persist-theme-a #'enable-theme)
  (advice-add 'enable-theme :after #'my/persist-theme-a))

(defun my/apply-theme (theme)
  "Disable active themes and load THEME."
  (interactive)
  (setq doom-theme theme)
  (mapc #'disable-theme custom-enabled-themes)
  (load-theme theme t)
  (my/save-theme theme))

(defun my/capture-theme-screenshot (theme)
  "Capture screenshot of THEME buffer (placeholder implementation)."
  (let ((img-file (expand-file-name (format "%s.png" theme) my/theme-gallery-dir)))
    (with-temp-file img-file
      (insert (format "Image placeholder for %s" theme)))
    img-file))

(defun my/show-theme-gallery ()
  "Show a clickable grid of all available themes with screenshots in Emacs. (Legacy version)"
  (interactive)
  (let* ((themes (custom-available-themes))
         (gallery-buffer (get-buffer-create "*Doom Theme Gallery*"))
         (img-width 220))
    (with-current-buffer gallery-buffer
      (let ((inhibit-read-only t))
        (erase-buffer)
        (let* ((cols (max 1 (/ (window-body-width) (+ img-width 10))))
               (count 0))
          (dolist (theme themes)
            (let* ((img-file (expand-file-name (format "%s.png" theme) my/theme-gallery-dir))
                   (img (when (file-exists-p img-file)
                          (create-image img-file 'png nil :width img-width))))
              (when img
                (insert-text-button
                 " "
                 'action (lambda (_)
                           (interactive)
                           (mapc #'disable-theme custom-enabled-themes)
                           (load-theme theme t)
                           (setq doom-theme theme)
                           (message "Theme switched to %s" theme))
                 'help-echo (symbol-name theme)
                 'follow-link t
                 'display img)
                (insert (propertize (format "\n%s\n" (symbol-name theme))
                                    'face '(:height 0.9 :family "monospace")))
                (setq count (1+ count))
                (when (= (mod count cols) 0)
                  (insert "\n\n"))))))
        (goto-char (point-min))
        (special-mode)
        (read-only-mode 1)
        (local-set-key (kbd "q") #'kill-this-buffer)))
    (pop-to-buffer gallery-buffer '((display-buffer-reuse-window display-buffer-same-window)))
    (delete-other-windows)))

(defun my/theme-gallery-css-from-theme ()
  "Dynamically extract basic colors from the current theme for CSS."
  (let* ((bg   (face-background 'default nil t))
         (fg   (face-foreground 'default nil t))
         (acc  (or (face-foreground 'font-lock-keyword-face nil t) "#89b4fa"))
         (box  (or (face-background 'mode-line-inactive nil t) "#313244")))
    (format "
body { background: %s; color: %s; margin: 0; font-family: system-ui,sans-serif; }
.gallery { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 32px; padding: 2em; }
.theme-thumb { background-size: cover; background-position: center; width: 180px; height: 110px; margin: 0 auto 0.4em auto; border-radius: 10px; box-shadow: 0 2px 8px #0005; border: 2px solid %s; cursor: pointer; transition: border 0.2s, box-shadow 0.2s; }
.theme-thumb:hover { border-color: %s; box-shadow: 0 4px 20px %s80; }
.theme-name { text-align: center; font-size: 1em; font-family: monospace; }
@media (max-width: 700px) { .gallery { grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); } .theme-thumb { width: 110px; height: 72px; } }
" bg fg box acc acc)))

(defun my/theme-gallery--html-head ()
  (concat
   "<!DOCTYPE html>
<html lang=\"en\">
<head>
  <meta charset=\"UTF-8\">
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
  <title>Doom Emacs Theme Gallery</title>
  <style>\n"
  (my/theme-gallery-css-from-theme)
  "\n</style>
</head>
<body>
  <h1 style=\"text-align:center;font-size:1.7em;letter-spacing:0.08em\">Doom Emacs Theme Gallery</h1>
  <div class=\"gallery\">
"))

(defun my/theme-gallery--html-end ()
  "</div>
<script>
function switchTheme(themeName) {
  fetch('/my-theme-gallery/' + encodeURIComponent(themeName)).then(r=>r.text());
}
document.querySelectorAll('.theme-thumb').forEach(function(div) {
  div.addEventListener('click', function() {
    switchTheme(this.dataset.theme);
  });
});
</script>
</body></html>")

(defun my/generate-theme-gallery-html ()
  "Generate a clickable, responsive HTML theme gallery with live theme-matched CSS."
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
            (insert "<div style='display:flex;flex-direction:column;align-items:center'>")
            (insert (format
                     "<div class=\"theme-thumb\" title=\"%s\" data-theme=\"%s\" style=\"background-image:url('%s')\"></div>"
                     theme-name theme-name img-url))
            (insert (format "<div class=\\\"theme-name\\\">%s</div>" theme-name))
            (insert "</div>\n"))))
      (insert (my/theme-gallery--html-end)))
    (message "✅ Theme gallery HTML generated: %s" my/theme-gallery-html)))

(defun my/open-theme-gallery-kiosk ()
  "Open the theme gallery in Chromium app mode (no tabs/address bar, full window)."
  (interactive)
  (let ((gallery-path (expand-file-name "theme-gallery/theme-gallery.html" doom-user-dir))
        (chromium-bin "chromium"))
    (if (file-exists-p gallery-path)
        (start-process "theme-gallery-chromium" nil
                       chromium-bin
                       "--kiosk"
                       (format "--app=file://%s" gallery-path))
      (message "Gallery HTML not found: %s" gallery-path))))

(defun my/generate-gallery-screenshot-script ()
  "Run the theme_screenshot.fish script asynchronously."
  (interactive)
  (start-process-shell-command
   "theme-screenshot"
   "*theme-screenshot-output*"
   "~/.doom.d/scripts/theme-screenshot.fish"))

;;(add-hook 'doom-load-theme-hook #'my/generate-theme-gallery-html)

(defun my/theme-gallery-write-clickable-html ()
  "Generate clickable HTML gallery; clicking switches the Emacs theme instantly."
  (interactive)
  (let* ((file (expand-file-name "index.html" my/theme-gallery-dir))
         (themes (or my/theme-gallery-themes (mapcar #'symbol-name (custom-available-themes)))))
    (with-temp-file file
      (insert "<!DOCTYPE html>\n<html>\n<head>\n")
      (insert "<meta charset='UTF-8'><title>Doom Emacs Theme Gallery</title>\n")                                 ;
      (insert "<style>
      body { background: #181825; color: #e0def4; font-family: sans-serif; }
      .gallery { display: flex; flex-wrap: wrap; gap: 1em; }
      .gallery img { border-radius: 12px; width: 200px; cursor: pointer; border: 3px solid transparent; transition: border-color 0.2s;}
      .gallery img.selected { border-color: #a6e3a1; }
      </style>\n")
      (insert "</head>\n<body>\n<h1>Doom Emacs Theme Gallery</h1>\n")
      (insert "<div class='gallery'>\n")
      (dolist (theme themes)
        (insert (format "<img src=\"%s.png\" data-theme=\"%s\" alt=\"%s\" />\n"
                        theme theme theme)))
      (insert "</div>\n")
      (insert "<script>
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-theme]').forEach(function (img) {
    img.onclick = function () {
      const theme = img.getAttribute('data-theme');
      fetch('/my-theme-gallery/' + encodeURIComponent(theme))
        .then(response => response.text())
        .then(msg => {
          document.querySelectorAll('.gallery img').forEach(i => i.classList.remove('selected'));
          img.classList.add('selected');
        });
    };
  });
});
</script>\n")
      (insert "</body>\n</html>\n"))))

(defun my/theme-gallery-split-html ()
  "Generate a modern split gallery with live preview, tile effects, and info."
  (interactive)
  (let* ((themes (custom-available-themes))
         (gallery-dir my/theme-gallery-dir)
         (html-file (expand-file-name "theme-gallery-split.html" gallery-dir)))
    (with-temp-file html-file
      (insert "<!DOCTYPE html>
<html lang=\"en\">
<head>
<meta charset=\"UTF-8\">
<title>Doom Emacs Theme Gallery - Split Preview</title>
<style>
body { margin:0; background:#20232a; color:#eceff4; font-family:system-ui,sans-serif; }
.split-container { display: flex; height: 100vh; width: 100vw; }
.gallery-panel {
  flex: 2;
  padding: 2em 1em 2em 2em;
  display: flex;
  flex-direction: column;
  background: #23283a;
  box-shadow: 3px 0 18px #0003;
}
.preview-panel {
  flex: 1;
  background: #181a20;
  padding: 2em 2em 2em 1em;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 350px;
  box-shadow: -4px 0 18px #0002;
}
.theme-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 28px;
}
.theme-tile {
  background: #26293a;
  border-radius: 22px;
  box-shadow: 0 4px 28px #0006;
  padding: 1.3em 0.6em 0.6em 0.6em;
  transition: box-shadow 0.22s;
  cursor: pointer;
  position: relative;
  text-align: center;
}
.theme-thumb {
  width: 280px;
  height: 180px;
  border-radius: 14px;
  box-shadow: 0 2px 14px #0004;
  border: 3px solid #444;
  object-fit: cover;
  transition: box-shadow 0.18s, border-color 0.18s, transform 0.23s;
}
.theme-tile:hover .theme-thumb, .theme-tile.active .theme-thumb {
  border-color: #6df2ff;
  box-shadow: 0 0 25px #6df2ff88, 0 2px 14px #0007;
  transform: scale(1.07);
  z-index: 3;
}
.theme-name {
  font-family: monospace;
  margin: 0.5em 0 0 0;
  font-size: 1.09em;
  color: #a8dfef;
  letter-spacing: 0.01em;
}
.preview-img {
  width: 420px;
  height: 270px;
  margin-bottom: 1em;
  border-radius: 22px;
  border: 4px solid #6df2ff;
  box-shadow: 0 0 36px #6df2ff55, 0 2px 18px #0007;
  object-fit: cover;
  background: #23283a;
  transition: border-color 0.2s, box-shadow 0.2s;
}
#theme-info {
  font-size: 1.12em;
  margin-top: 1em;
  color: #9fd8ff;
  text-align: center;
  font-family: monospace;
  word-break: break-word;
}
::-webkit-scrollbar { width: 10px; background: #191c26; }
::-webkit-scrollbar-thumb { background: #3d4161; border-radius: 10px;}
</style>
</head>
<body>
<div class=\"split-container\">
  <div class=\"gallery-panel\">
    <h2 style=\"text-align:center; margin-bottom:1.2em; letter-spacing:0.07em\">Theme Gallery</h2>
    <div class=\"theme-grid\">
")
      (let ((first-img-url nil) (first-theme-name nil))
        (dolist (theme themes)
          (let* ((theme-name (symbol-name theme))
                 (img-file (expand-file-name (format "%s.png" theme-name) gallery-dir))
                 (img-url (file-name-nondirectory img-file)))
            (when (file-exists-p img-file)
              (unless first-img-url
                (setq first-img-url img-url
                      first-theme-name theme-name))
              (insert (format "
      <div class=\"theme-tile\" data-theme=\"%s\">
        <img class=\"theme-thumb\" src=\"%s\" alt=\"%s\" data-theme=\"%s\">
        <div class=\"theme-name\">%s</div>
      </div>
" theme-name img-url theme-name theme-name theme-name)))))
        (insert "</div>
  </div>
  <div class=\"preview-panel\">
    <div id=\"preview-box\">
      <img id=\"theme-preview\" class=\"preview-img\" src=\"" (or first-img-url "") "\" alt=\"" (or first-theme-name "") "\">
      <div id=\"theme-info\">" (or first-theme-name "") "</div>
    </div>
  </div>
</div>
<script>
document.addEventListener('DOMContentLoaded', function() {
  const previewImg = document.getElementById('theme-preview');
  const infoDiv = document.getElementById('theme-info');
  let currentTile = null;
  document.querySelectorAll('.theme-tile').forEach(function(tile) {
    tile.addEventListener('mouseenter', function() {
      let theme = tile.dataset.theme;
      let img = tile.querySelector('img');
      // Show big preview
      previewImg.src = img.src;
      previewImg.alt = theme;
      infoDiv.innerText = theme;
      if(currentTile) currentTile.classList.remove('active');
      tile.classList.add('active');
      currentTile = tile;
    });
    tile.addEventListener('mouseleave', function() {
      tile.classList.remove('active');
    });
    tile.addEventListener('click', function() {
      let theme = tile.dataset.theme;
      fetch('/my-theme-gallery/' + encodeURIComponent(theme));
    });
  });
});
</script>
</body>
</html>
")))))

(provide 'theme-gallery)
(message "✅ theme-gallery.el loaded")
