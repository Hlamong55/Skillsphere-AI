
import {
  FiFileText,
  FiUsers,
  FiUserCheck,
} from "react-icons/fi";

const ProfileStats = ({
  user,
  postsCount,
}) => {
  const stats = [
    {
      label: "Posts",
      value: postsCount ?? "—",
      icon: FiFileText,
    },
    {
      label: "Followers",
      value: Array.isArray(user?.followers)
        ? user.followers.length
        : 0,
      icon: FiUsers,
    },
    {
      label: "Following",
      value: Array.isArray(user?.following)
        ? user.following.length
        : 0,
      icon: FiUserCheck,
    },
  ];

  return (
    <section aria-label="Profile Statistics">

      <div className="grid grid-cols-3 gap-2 sm:gap-4">

        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-2xl border border-white/10 bg-[#111827] px-2 py-5 sm:p-5 text-center transition-colors hover:border-indigo-500/30"
            >

              <div className="mx-auto mb-3 flex h-10 w-12 items-center justify-center rounded-xl bg-indigo-500/10">
                <Icon
                  size={22}
                />
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                {item.value}
              </h2>

              <p className="mt-2 text-xs sm:text-sm text-gray-400">
                {item.label}
              </p>

            </div>
          );
        })}

      </div>

    </section>
  );
};

export default ProfileStats;
