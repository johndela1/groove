system_diagram: system_diagram.pdf
	xpdf -z 300 system_diagram.pdf

clean:
	rm *.aux *.log *.pdf

system_diagram.pdf: system_diagram.dot
	dot -Tpdf -o system_diagram.pdf system_diagram.dot
