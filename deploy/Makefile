MANIFESTS=k8s
CONTEXT=context
WORKDIR=$(shell pwd)
UID=$(shell id -u)

.PHONY: render clean

render:
	find ${MANIFESTS} -name "*.y*ml" | sort | while read f; do \
            b=`basename $$f | sed -e s,.yml,,g -e s,.yaml,,g -e s,-,_,g`; \
            sum=`sha256sum $$f | awk '{print $$1}'`; \
            echo "sha256_$$b: $$sum"; \
          done >> ${CONTEXT}
	find ${MANIFESTS} -name "*.tmpl" | sort | while read f; do \
		dir=`dirname $$f`; \
		n=`basename $$f .tmpl`; \
		b=`basename $$f .tmpl | sed -e s,.yml,,g -e s,.yaml,,g -e s,-,_,g`; \
		docker run -i --rm=true -u ${UID} -v ${WORKDIR}:${WORKDIR} -w ${WORKDIR} genunix/gotpl $$f < ${CONTEXT} > $$dir/$$n; \
		sum=`sha256sum $$dir/$$n | awk '{print $$1}'`; \
		echo "sha256_$$b: $$sum" >> ${CONTEXT}; \
		done

clean:
	rm -f context
	find ${MANIFESTS} -name "*.tmpl" | sort | while read f; do \
		dir=`dirname $$f`; \
		n=`basename $$f .tmpl`; \
		rm -f $$dir/$$n; \
		done
