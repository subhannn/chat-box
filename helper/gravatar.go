package helper

import (
	"crypto/md5"
	"fmt"
	"io"
)

func GetGravatarUrl(email string) string {
	md := md5.New()
	io.WriteString(md, email)

	mds := fmt.Sprintf("%x", md.Sum(nil))

	return fmt.Sprintf(`https://www.gravatar.com/avatar/%s`, mds)
}
