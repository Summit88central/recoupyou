export const sendPersonalTrainingEmail = async (formData: any) => {
  try {
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "personal-training",
        formData,
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || "Failed to send email");
    }

    const data = await response.json();
    return { success: true, response: data };
  } catch (error: any) {
    console.error("Personal Training Email Error:", error);
    return { success: false, error };
  }
};

export const sendOnlineCoachingEmail = async (formData: any) => {
  try {
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "online-coaching",
        formData,
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || "Failed to send email");
    }

    const data = await response.json();
    return { success: true, response: data };
  } catch (error: any) {
    console.error("Online Coaching Email Error:", error);
    return { success: false, error };
  }
};

export const sendMembershipEmail = async (formData: any) => {
  try {
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "membership",
        formData,
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || "Failed to send email");
    }

    const data = await response.json();
    return { success: true, response: data };
  } catch (error: any) {
    console.error("Membership Email Error:", error);
    return { success: false, error };
  }
};
