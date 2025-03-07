interface User {
  id?: string;
  _id?: string;
  username?: string;
  role?: string;
  agencyName?: string;
  [key: string]: any;
}

export const checkUserDataStructure = (): User | null => {
  const userString = localStorage.getItem("user");
  if (!userString) {
    console.error("No user data in localStorage");
    return null;
  }

  try {
    const user = JSON.parse(userString) as User;
    console.log("User data structure:", user);

    if (!user.agencyName) {
      console.warn("User data missing agencyName property!");
    }

    return user;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};
