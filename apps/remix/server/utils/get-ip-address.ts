export const getIpAddress = (req: Request) => {
    const forwarded = req.headers.get('x-forwarded-for');
    return forwarded ? forwarded.split(',')[0] : '127.0.0.1';
};
