package reflect

import (
	"context"
	"encoding/json"
	"io/ioutil"
	"net/http"
)

type Resp struct {
	Head   http.Header `json:"head"`
	Body   string
	Cookie []*http.Cookie
	Ctx    context.Context
	Host   string
	Method string
	Url    string
	Length int64
}

func Handler(writter http.ResponseWriter, req *http.Request) {
	length := req.ContentLength
	body, _ := ioutil.ReadAll(req.Body)
	res := Resp{
		Head:   req.Header,
		Body:   string(body),
		Cookie: req.Cookies(),
		Ctx:    req.Context(),
		Host:   req.Host,
		Method: req.Method,
		Url:    req.URL.RawPath,
		Length: length,
	}
	json.NewEncoder(writter).Encode(res)
}
