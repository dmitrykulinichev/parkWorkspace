const path = require('path');

const REPO   = path.resolve(__dirname, '../../../..');
const APP_JS = path.join(REPO, 'app/park-react-spa/resources/js');

module.exports = {
  idoc: {
    registry: path.join(REPO, 'app/park-react-spa/resources/js/common/i-doc/i-doc.registry.ts'),
    mapping:  path.join(REPO, 'app/park-react-spa/resources/js/common/i-doc/i-doc.mapping.ts'),
    hints:    path.join(REPO, 'app/park-react-spa/resources/js/common/i-doc/i-doc.hints.ts'),
  },
  navItems: path.join(APP_JS, 'components/Navigation/NavigationItems.js'),
  catalog:      path.join(REPO, 'workspace/user-docs2/_meta/CATALOG.md'),
  screenshots:  path.join(REPO, 'workspace/user-docs2/_meta/screenshots.json'),
  nav:          path.join(REPO, 'workspace/user-docs2/_meta/nav.json'),
  warnings:     path.join(REPO, 'workspace/user-docs2/_meta/WARNINGS.md'),
  catalogJson:  path.join(REPO, 'workspace/user-docs2/data/catalog.json'),
};
