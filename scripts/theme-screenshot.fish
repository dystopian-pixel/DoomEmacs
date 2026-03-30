#!/usr/bin/env fish

set THEME_DIR ~/.doom.d/theme-gallery
mkdir -p $THEME_DIR

# Set your monitor name (check with: grim -l)
set MONITOR "DP-2"

# Get all available themes, removing parens and double quotes
set themes (emacsclient --eval "(prin1-to-string (custom-available-themes))" \
    | string trim \
    | string replace -ar '[()]' '' \
    | string replace -ar '"' '' \
    | string split ' ')

for theme in $themes
    if test $theme = "light-blue"
        echo "Skipping obsolete theme $theme"
        continue
    end
    echo "Switching to $theme"
    emacsclient --eval "
      (let ((inhibit-message t)
            (warning-minimum-level :error))
        (ignore-errors
          (mapc #'disable-theme custom-enabled-themes)
          (load-theme '$theme t)))"
    sleep 2
    grim -o $MONITOR $THEME_DIR/$theme.png
    echo "Screenshot saved for $theme"
    sleep 1
end


echo "All theme screenshots complete!"

