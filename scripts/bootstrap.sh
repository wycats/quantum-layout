rm -f ./public/bootstrap/*
swc -c ./.swcrc -d ./public ./bootstrap-src/**/*.ts -s inline --ignore ./bootstrap/*.d.ts -w
