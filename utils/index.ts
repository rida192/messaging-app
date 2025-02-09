export const encodeProfilePicturesPath = (url) => {
  return url?.replace("/profilePictures/", "/profilePictures%2F");
};

export const generateChatId = (userId1: string, userId2: string) => {
  return userId1 < userId2 ? `${userId1}_${userId2}` : `${userId2}_${userId1}`;
};
