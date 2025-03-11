import axios from "axios";

const OMNICHANNEL_URL = "https://staging.lenna.ai";

const API = async (props: any) => {
  const {
    path,
    method = "GET",
    params = {},
    data,
    responseType = "json",
    headers = {},
  } = props;
  const timeout = 36e5;

  const config = {
    timeout,
    baseURL: OMNICHANNEL_URL,
    url: path,
    method,
    data,
    responseType,
    params: {
      ...params,
    },
    headers,
  };
  const response = await axios(config);
  return response.data;
};

export default API;
