import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";

export const useGetUserProfile = (userId) => {
  return useQuery({
    queryKey: ["userProfile", userId],
    queryFn: async () => {
      const { data } = await api.get(`/users/${userId}/profile`);
      return data.data;
    },
    enabled: !!userId,
  });
};
