import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET() {
  try {
    // Get the userId from Clerk auth
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ active: false }, { status: 400 });
    }

    // get user subscription data from supabase
    const { data: userData, error } = await supabase
      .from("ChatBot_Users")
      .select("stripeCustomerId, stripeSubscriptionId, subscriptionStatus")
      .eq("clerk_user_id", userId)
      .single();

    if (error || !userData?.stripeCustomerId || !userData?.stripeSubscriptionId) {
      return NextResponse.json({ active: false });
    }

    // verify subscription status with stripe
    const subscription = await stripe.subscriptions.retrieve(userData.stripeSubscriptionId);

    // check if stripe subscription is active
    const isActive = subscription.status === "active" || subscription.status === "trialing";

    // if stripe and supabase are out of sync, update supabase
    if (isActive && userData.subscriptionStatus !== subscription.status) {
      await supabase
        .from("ChatBot_Users")
        .update({
          subscriptionStatus: subscription.status,
          subscriptionPeriodEnd: new Date(subscription.current_period_end * 1000),
          updatedAt: new Date().toISOString(),
        })
        .eq("clerk_user_id", userId);
    }

    return NextResponse.json({
      active: isActive,
      expiresAt: new Date(subscription.current_period_end * 1000),
      status: subscription.status,
    });
  } catch (error) {
    console.error("Subscription check failed:", error);
    return NextResponse.json({ active: false }, { status: 500 });
  }
}
