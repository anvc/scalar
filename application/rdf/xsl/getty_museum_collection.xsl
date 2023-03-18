<?xml version="1.0" encoding="UTF-8"?>   
<xsl:stylesheet version="1.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" 
                xmlns:scalar="http://vectorsdev.usc.edu/scalar/elements/1.0/"
                xmlns:dc="http://purl.org/dc/elements/1.1/"
                xmlns:dcterms="http://purl.org/dc/terms/"
                xmlns:art="http://simile.mit.edu/2003/10/ontologies/artstor#"
                xmlns:sioc="http://rdfs.org/sioc/ns#">  

  	<!-- Variales -->
  
   	<xsl:variable name="archiveName">
		<xsl:text>Getty Museum Collection</xsl:text>
	</xsl:variable>    

   	<xsl:variable name="archiveDomain">
		<xsl:text>http://www.getty.edu/art</xsl:text>
	</xsl:variable>   

  	<!-- Templates -->
  	
	<xsl:template match="/">
		<rdf:RDF>
			<xsl:apply-templates select="//td[@width='339']" />
		</rdf:RDF>		
	</xsl:template>  	

	<xsl:template match="*"></xsl:template>

	<xsl:template match="//td[@width='339']">
		<xsl:if test="position() mod 2 = 0">
			<xsl:variable name="identifier_odd"><xsl:value-of select="format-number(substring-after(../td[position() = 2]/a/@href,'artobj='),'000000')" /></xsl:variable>
			<xsl:variable name="identifier_even"><xsl:value-of select="format-number(substring-after(../td[position() = 6]/a/@href,'artobj='),'000000')" /></xsl:variable>	 		
			<rdf:Description rdf:about="{../td[position() = 2]/a/@href}">
				<art:thumbnail rdf:resource="{../td[position() = 2]/a/img/@src}" />
				<xsl:if test="$identifier_odd != 'NaN'">
					<art:filename rdf:resource="http://www.getty.edu/art/collections/images/l/{$identifier_odd}01.jpg"></art:filename>
					<dcterms:identifier><xsl:value-of select="$identifier_odd"/></dcterms:identifier>
				</xsl:if>	
				<dcterms:source><xsl:value-of select="$archiveName"/></dcterms:source>
				<art:sourceLocation rdf:resource="{../td[position() = 2]/a/@href}" />
				<dcterms:title><xsl:value-of select="../td[position() = 4]/a/strong"/></dcterms:title>		
				<dcterms:contributor><xsl:value-of select="normalize-space(../td[position() = 4]/text()[position() = 2])"/> (<xsl:value-of select="normalize-space(../td[position() = 4]/text()[position() = 3])"/>)</dcterms:contributor>
				<dcterms:type>Image</dcterms:type>	
			</rdf:Description>
			<rdf:Description rdf:about="{../td[position() = 6]/a/@href}">
				<art:thumbnail rdf:resource="{../td[position() = 6]/a/img/@src}" />
				<xsl:if test="$identifier_even != 'NaN'">
					<art:filename rdf:resource="http://www.getty.edu/art/collections/images/l/{$identifier_even}01.jpg"></art:filename>
					<dcterms:identifier><xsl:value-of select="$identifier_even"/></dcterms:identifier>
				</xsl:if>	
				<dcterms:source><xsl:value-of select="$archiveName"/></dcterms:source>
				<art:sourceLocation rdf:resource="{../td[position() = 6]/a/@href}" />
				<dcterms:title><xsl:value-of select="../td[position() = 8]/a/strong"/></dcterms:title>
				<dcterms:contributor><xsl:value-of select="normalize-space(../td[position() = 8]/text()[position() = 2])"/> (<xsl:value-of select="normalize-space(../td[position() = 8]/text()[position() = 3])"/>)</dcterms:contributor>
				<dcterms:type>Image</dcterms:type>	
			</rdf:Description>		
		</xsl:if>
	</xsl:template>  


</xsl:stylesheet>