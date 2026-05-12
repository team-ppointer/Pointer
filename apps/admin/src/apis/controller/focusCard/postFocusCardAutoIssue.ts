import { $api } from '@apis';

const postFocusCardAutoIssue = () => {
  return $api.useMutation('post', '/api/admin/focus-card/auto-issue');
};

export default postFocusCardAutoIssue;
