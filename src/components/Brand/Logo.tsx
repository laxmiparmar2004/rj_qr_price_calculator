import { brandLogoSrc } from "../../utility/config"

export const RJLogo = ({ size = 'lg', className="" }: { size?: 'lg' | 'md' | 'sm', className? : string  }) => {
    return (
        <img src={brandLogoSrc[size]} alt="RJ Logo"  className={className} />
    )
}