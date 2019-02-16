const getFolderName = (data) => {
  return `${data.listId}--${data.taskId}`
}

module.exports = getFolderName;
