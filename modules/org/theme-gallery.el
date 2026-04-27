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
