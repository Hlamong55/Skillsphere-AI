const ProfileStats = ({
  user,
}) => {
  const stats = [
    {
      label: "Followers",
      value:
        user?.followers
          ?.length || 0,
    },

    {
      label: "Following",
      value:
        user?.following
          ?.length || 0,
    },

    {
      label: "Skills",
      value:
        user?.skills
          ?.length || 0,
    },
  ];

  return (
    <div
      className="
        grid
        md:grid-cols-3
        gap-5
        mt-8
      "
    >
      {stats.map(
        (item, index) => (
          <div
            key={index}
            className="
              bg-white/3
              border border-white/10
              rounded-2xl
              p-6

              text-center
            "
          >
            <h2
              className="
                text-3xl
                font-bold
                text-white
              "
            >
              {item.value}
            </h2>

            <p
              className="
                text-gray-400
                mt-2
              "
            >
              {item.label}
            </p>
          </div>
        )
      )}
    </div>
  );
};

export default ProfileStats;