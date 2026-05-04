import '@servicenow/sdk/global';
import { UiPage } from '@servicenow/sdk/core';
import flexdeskPage from '../../client/index.html';

export const flexdesk_main = UiPage({
  $id: Now.ID['flexdesk-main'],
  endpoint: 'x_wsb_flex_main.do',
  html: flexdeskPage,
  direct: true,
});
