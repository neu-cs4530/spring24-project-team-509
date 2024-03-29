React.use(Chakra, {
    icons: {
      iconPack: 'fa',
      iconSet: {
        fa-stroopwafel,
        fa-pizza-slice,
        fa-pepper-hot,
        fa-lemon,
        fa-ice-cream,
        fa-hotdog,
        fa-hamburger,
        fa-fish,
        fa-egg,
        fa-cookie,
        fa-cheese,
        fa-carrot,
        fa-candy-cane,
        fa-bread-slice,
        fa-bacon,
        fa-apple-alt
      }
    }
})

function IconImage(itemName: string) {
    return (
        <CIcon></CIcon>
    )
}