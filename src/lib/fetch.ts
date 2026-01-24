import axios from "axios";
export const refresshToken = async (token: string) => {
  const refresh_token = await axios.get(
    `${process.env.INSTAGRAM_BASE_URL}/refresh_access_token?grand_type=id_refresh_token&access_token=${token}`,
  );

  return refresh_token.data;
};
