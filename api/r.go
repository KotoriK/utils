package reflect

import (
	"encoding/json"
	"net/http"
)

func h(writter http.ResponseWriter, req *http.Request) {
	json.NewEncoder(writter).Encode(req)
}
