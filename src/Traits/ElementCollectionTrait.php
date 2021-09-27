<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Traits;

use Drjele\Symfony\JsonForm\Element\AbstractElement;
use Drjele\Symfony\JsonForm\Element\ArrayElement;
use Drjele\Symfony\JsonForm\Element\AutocompleteElement;
use Drjele\Symfony\JsonForm\Element\BoolElement;
use Drjele\Symfony\JsonForm\Element\CollectionElement;
use Drjele\Symfony\JsonForm\Element\DateElement;
use Drjele\Symfony\JsonForm\Element\IntegerElement;
use Drjele\Symfony\JsonForm\Element\StringElement;
use Drjele\Symfony\JsonForm\Exception\Exception;

trait ElementCollectionTrait
{
    /** @var AbstractElement[] */
    private array $elements = [];

    public function addArray(
        string $name,
        string $label,
        array $options,
        string $dataType,
        string $mode,
        string $frontEndType = null
    ): self {
        $element = new ArrayElement($name, $label, $frontEndType);

        $element->setOptions($options)
            ->setDataType($dataType)
            ->setMode($mode);

        $this->addElement($element);

        return $this;
    }

    public function addAutocomplete(
        string $name,
        string $label,
        string $route,
        string $dataType,
        string $mode,
        string $queryParam = 'query',
        string $frontEndType = null
    ): self {
        $element = new AutocompleteElement($name, $label, $frontEndType);

        $element->setRoute($route)
            ->setQueryParam($queryParam)
            ->setDataType($dataType)
            ->setMode($mode);

        $this->addElement($element);

        return $this;
    }

    public function addBool(string $name, string $label, string $frontEndType = null): self
    {
        $element = new BoolElement($name, $label, $frontEndType);

        $this->addElement($element);

        return $this;
    }

    public function addCollection(string $name, string $label, string $frontEndType = null): CollectionElement
    {
        $collection = new CollectionElement($name, $label, $frontEndType);

        $this->addElement($collection);

        return $collection;
    }

    public function addInteger(
        string $name,
        string $label,
        int $min = null,
        int $max = null,
        string $frontEndType = null
    ): self {
        $element = new IntegerElement($name, $label, $frontEndType);

        $element->setMin($min)
            ->setMax($max);

        $this->addElement($element);

        return $this;
    }

    public function addString(string $name, string $label, string $frontEndType = null): self
    {
        $element = new StringElement($name, $label, $frontEndType);

        $this->addElement($element);

        return $this;
    }

    public function addDate(
        string $name,
        string $label,
        string $format = DateElement::FORMAT_Y_M_D,
        string $frontEndType = null
    ): self {
        $element = new DateElement($name, $label, $frontEndType);

        $element->setFormat($format);

        $this->addElement($element);

        return $this;
    }

    private function addElement(AbstractElement $element): self
    {
        if (isset($this->elements[$element->getName()])) {
            throw new Exception(\sprintf('duplicate element name `%s`', $element->getName()));
        }

        $this->elements[$element->getName()] = $element;

        return $this;
    }
}
