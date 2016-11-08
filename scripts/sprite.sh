#!/bin/bash

readonly SVG_FILE_OUTPUT=$1
readonly CSS_FILE_OUTPUT=$2
readonly IMAGE_SIZE=48
readonly IMAGES_DIR=./static/images/banks

svg="<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n"
css=".icon
{
    background-repeat: no-repeat;
    height: ${IMAGE_SIZE}px;
    width: ${IMAGE_SIZE}px;
}
"

y=0
for icon in "$IMAGES_DIR"/*
do
    filename=$(basename "$icon")
    filename="${filename%.*}"
    content=$(base64 -w 0 "$icon")

    svg="$svg\t<image x=\"0\" y=\"$y\" width=\"$IMAGE_SIZE\" height=\"$IMAGE_SIZE\" xlink:href=\"data:image/png;base64,$content\" />\n"
    svg="$svg\t<view id=\"$filename\" viewBox=\"0 $y $IMAGE_SIZE $IMAGE_SIZE\" overflow=\"hidden\" />\n\n"

    css="$css
.icon-$filename { background-image: url('../images/sprite.svg#$filename'); }"

    y=$(( y + $IMAGE_SIZE ))
done

svg="$svg\\n</svg>"

echo -e "$svg" > "$SVG_FILE_OUTPUT"
echo -e "$css" > "$CSS_FILE_OUTPUT"
exit 0
