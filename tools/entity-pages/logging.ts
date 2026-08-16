export const LogVerbose = true;
const BannerChar = "-";

export function bannerTitle(title: string, bannerLength = 100): string {

  const bannerCharAmount = Math.max(0, bannerLength - title.length);
  const side = BannerChar.repeat(Math.floor(bannerCharAmount / 2));

  return `${side}${title}${side}${bannerCharAmount % 2 !== 0 ? BannerChar : ""}`;
}