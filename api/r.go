package reflect

import (
	"context"
	"encoding/json"
	"io/ioutil"
	"net/http"
)

type Resp struct {
	head    http.Header
	body    string
	cookie  []*http.Cookie
	context context.Context
	host    string
	method  string
	url     string
	length  int64
}

func Handler(writter http.ResponseWriter, req *http.Request) {
	length := req.ContentLength
	body, _ := ioutil.ReadAll(req.Body)
	res := Resp{
		head:    req.Header,
		body:    string(body),
		cookie:  req.Cookies(),
		context: req.Context(),
		host:    req.Host,
		method:  req.Method,
		url:     req.URL.RawPath,
		length:  length,
	}
	json.NewEncoder(writter).Encode(res)
}
