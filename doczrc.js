/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable global-require */
import url from 'url';
import packageInfo from './package.json';

/**
 * 获取基本URL
 */
function getBaseUrl() {
  if (process.env.NODE_ENV === 'production') {
    const { name, homepage } = packageInfo;

    if (homepage) {
      return url.parse(homepage).path;
    }
    if (name.startsWith('@')) {
      return name.substr(name.indexOf('/'));
    }
    return `/${name}`;
  }
  return '/';
}

export default {
  title: 'sinoui-tree',
  codeSandbox: false,
  typescript: true,
  files: ['**/*.mdx'],
  public: './docs/assets',
  menu: ['首页'],
  base: getBaseUrl(),
  propsParser: false,
};
