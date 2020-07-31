"use strict";

module.exports = {
  env: {
    NODE_ENV: "development",
    //dev
    BASE_URL: "https://gwdev.hcjia.com",
    CMS_BASE_URL: "https://cmsdev.hcjia.com",
  },

  defineConstants: {},
  weapp: {
    module: {
      postcss: {
        autoprefixer: {
          enable: true,
        },
        // 小程序端样式引用本地资源内联配置
        url: {
          enable: true,
          config: {
            limit: 10240, // 文件大小限制
          },
        },
      },
    },
  },
  h5: {},
};
