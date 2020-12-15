package base64

import (
	"encoding/base64"
	"encoding/json"
	"errors"
	"net/http"
)

type Result struct {
	Ok   bool   `json:"ok"`
	Data string `json:"data"`
}

func Base64Handler(w http.ResponseWriter, req *http.Request) {
	query := req.URL.Query()
	queryEncode := query.Get("encode")
	queryDecode := query.Get("decode")

	var result string
	var err error
	ok := false

	if queryEncode != "" {
		result = base64.StdEncoding.EncodeToString([]byte(queryEncode))
	} else if queryDecode != "" {
		var bytesArray []byte
		bytesArray, err = base64.StdEncoding.DecodeString(queryDecode)
		result = string(bytesArray[:])
	} else {
		w.WriteHeader(404)
		err = errors.New("method not support")
	}
	if err != nil {
		result = err.Error()
	} else {
		ok = true
	}
	w.Header().Add("Cache-Control", "s-maxage=60")
	json.NewEncoder(w).Encode(Result{
		Ok:   ok,
		Data: result,
	})

}
