rm -rf dist
mkdir dist
cp -r src/* dist

cp dist/index.ts dist/index.js
cp dist/components.ts dist/components.js
cp dist/containers.ts dist/containers.js
