import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import api from "../services/api";

import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileStats from "../components/profile/ProfileStats";
import UserPosts from "../components/profile/UserPosts";

const Profile = () => {
  const { id } = useParams();

  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const fetchProfile =
      async () => {
        try {
          const { data } =
            await api.get(
              `/users/${id}`
            );

          setUser(data);
        } catch (error) {
          console.log(error);
        } finally {
          setLoading(false);
        }
      };

    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div
        className="
          min-h-screen
          flex items-center justify-center
          text-white
        "
      >
        Loading Profile...
      </div>
    );
  }

  return (
    <div
      className="
        max-w-6xl
        mx-auto
        px-6
        py-8
      "
    >
      <ProfileHeader user={user} />

      <ProfileStats user={user} />

      <UserPosts userId={id} />
    </div>
  );
};

export default Profile;