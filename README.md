# for Static Site Deploy
>정적 사이트 배포를 위한 심플한 구성의 템플릿

```
static-gulp/
  │
  ├─ gulpfile.babel.js
  ├─ package.json
  ├─ postcss.config.js
  ├─ .babelrc
  ├─ .prettierrc
  │
  ├─ src << 작업 디렉토리
  │   ├─ assets
  │   │   ├─ scss
  │   │   ├─ fonts
  │   │   ├─ images
  │   │   └─ js
  │   ├─ partials
  │   │   └─ base.html
  │   ├─ index.html
  │   └─ static-files.html
  │
  └─ dist << 배포시 생성되는 디렉토리
      ├─ assets
      │   ├─ css
      │   ├─ fonts
      │   ├─ images
      │   └─ js
      ├─ index.html
      └─ static-files.html
```
