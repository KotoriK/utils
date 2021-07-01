package reflect

import (
	"context"
	"encoding/json"
	"io/ioutil"
	"net/http"
	"net/url"
)

//Resp Response
type Resp struct {
	Head    http.Header
	Trailer http.Header
	Host    string
	Method  string
	URL     url.URL
	Query   url.Values
	Length  int64
	Proto   string
	Body    string
	Cookie  []*http.Cookie
	Ctx     context.Context
}

//ReflectHandler Handler
func ReflectHandler(writter http.ResponseWriter, req *http.Request) {
	length := req.ContentLength
	body, _ := ioutil.ReadAll(req.Body)
	res := Resp{
		Head:    req.Header,
		Body:    string(body),
		Cookie:  req.Cookies(),
		Ctx:     req.Context(),
		Host:    req.Host,
		Method:  req.Method,
		URL:     *req.URL,
		Query:   req.URL.Query(),
		Length:  length,
		Proto:   req.Proto,
		Trailer: req.Trailer,
	}
	writter.Header().Add("Content-Type", "application/json; charset=utf-8")
	json.NewEncoder(writter).Encode(res)
}
