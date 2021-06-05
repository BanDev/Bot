require('dotenv').config()

module.exports = (app) => {

  // When a new issue is opened assign jack & russell
  // and add 'Needs Dev Reply' to the message. If issue
  // is opened by a member, the message is never shown.
  app.on("issues.opened", async (context) => {
    if(context.payload.issue.author_association == "MEMBER") {
      return
    }
    context.octokit.issues.addAssignees(context.issue({ assignees: ["jackdevey", "russellbanks"] }));
    context.octokit.issues.addLabels(context.issue({ labels: [process.env.ISSUES_LABEL_DEV_REPLY_AWAIT] }));
    const issueComment = context.issue({
      body: process.env.ISSUES_ASSIGNED,
    });
    return context.octokit.issues.createComment(issueComment);
  });

  // When an issue comment is left, check if it comes
  // from a bandev member and if so remove the tag
  // that alerts us to the issue.
  app.on("issue_comment.created", async (context) => {
    if (context.payload.comment.author_association == "MEMBER") {
      await context.octokit.request('DELETE /repos/{owner}/{repo}/issues/{issue_number}/labels/{name}', {
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
        issue_number: context.payload.issue.number,
        name: process.env.ISSUES_LABEL_DEV_REPLY_AWAIT
      })
    }
  });

};
