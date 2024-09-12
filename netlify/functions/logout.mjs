import cookie from 'cookie'

export default async (request, context) => {
    const jwtCookie = cookie.serialize('jwt', 'deleted', {
        path: '/',
        httpOnly: true,
        expires: new Date(Date.now() + 86400000),
    });

    return Response.json({
        msg: 'All done!',
    }, {
        headers: {
            'set-cookie': jwtCookie
        }
    })
}